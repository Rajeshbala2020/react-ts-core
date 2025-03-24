import React, { useEffect, useRef, useState } from "react";
import { FieldErrors } from "react-hook-form";

type OTPInputProps = {
  BoxLength?: number;
  value?: string;
  onChangeOTP: (otp: string) => void;
  label?: string;
  errors?: FieldErrors;
  name: string;
  id: string;
  labelTitle?: string;
  initialTime?: number;
  callbackFn?: (data: boolean) => void;
};

const OTPInput: React.FC<OTPInputProps> = ({
  BoxLength = 6,
  onChangeOTP,
  value = "",
  label,
  errors,
  name,
  id,
  labelTitle,
  initialTime = 240,
  callbackFn,
}) => {
  // Initialize OTP state from value prop
  const [otp, setOtp] = useState<string[]>(
    value.split("").concat(Array(BoxLength - value.length).fill(""))
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [remainingTime, setRemainingTime] = useState<number>(initialTime);
  const [isTimerCompleted, setIsTimerCompleted] = useState<boolean>(false);

  useEffect(() => {
    // Synchronize local otp state with value prop changes
    setOtp(value.split("").concat(Array(BoxLength - value.length).fill("")));
  }, [value, BoxLength]);

  useEffect(() => {
    if (otp) onChangeOTP(otp.join(""));
  }, [otp]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timerId = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timerId);
    } else {
      setIsTimerCompleted(true);
    }
  }, [remainingTime]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < BoxLength - 1) {
      inputRefs.current[index + 1]?.focus(); // Move focus to next input
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus(); // Move focus to previous input
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("Text").slice(0, BoxLength);
    if (/[^0-9]/.test(pastedData)) return;

    const newOtp = pastedData
      .split("")
      .concat(Array(BoxLength - pastedData.length).fill(""));
    setOtp(newOtp);

    // Move focus to the last filled input field
    const lastIndex = newOtp.findIndex((val) => val === "");
    if (lastIndex !== -1) {
      inputRefs.current[lastIndex]?.focus();
    } else {
      inputRefs.current[BoxLength - 1]?.focus();
    }
  };

  const getErrors = (err: any) => {
    let errMsg = "";
    if (err.message) {
      errMsg = err?.message;
    }
    return errMsg;
  };

  const handleError = (data: any) => {
    if (
      getErrors(data[name]) === "required" ||
      getErrors(data[name]) === "Required"
    ) {
      return `${label ?? labelTitle} is ${getErrors(data[name])}`;
    } else {
      return getErrors(data[name]) ?? "";
    }
  };

  // Reset time function added
  const resetTimer = () => {
    setRemainingTime(initialTime);
    setIsTimerCompleted(false);
  };

  const handleResend = () => {
    if (isTimerCompleted) {
      callbackFn?.(isTimerCompleted);
      resetTimer();
    }
  };

  return (
    <div>
      {label && (
        <div className="mb-2 me-2">
          <label className={`text-grey-label font-normal text-common`}>
            {label}
          </label>
        </div>
      )}
      <div className="flex flex-col w-fit">
        <div
          className="flex gap-x-5 "
          id={id ? `input-otp-${id}` : `input-otp-${name}`}
        >
          {Array(BoxLength)
            .fill('')
            .map((_, index) => (
              <input
                key={index}
                name={name}
                id={id}
                type="text"
                autoComplete="off"
                value={otp[index]}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
                maxLength={1}
                onFocus={(e) => (e.target.style.borderColor = '#667085')}
                onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
                className="w-[54px] h-10 text-center text-lg  border border-[#D0D5DD] focus:border-[#667085] transition-colors duration-200 outline-none rounded-sm"
              />
            ))}
        </div>
        <div className="flex items-center pt-3">
          <p className="text-common text-[#475467]">Didn't receive a code? </p>
          <span
            className={`text-common text-[#003C71] ml-2  ${
              !isTimerCompleted ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            onClick={handleResend}
          >
            Resend Code
          </span>
        </div>
        <div>
          <span className="text-common text-[#475467]">
            Remaining Time: {formatTime(remainingTime)}
          </span>
        </div>

        <div className="flex justify-center items-center text-[#F94110] text-base font-medium	">
          {errors && errors[name] && <span> {handleError(errors)}</span>}
        </div>
      </div>
    </div>
  );
};

export default OTPInput;
