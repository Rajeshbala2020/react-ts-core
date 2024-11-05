export const getInnerWidth = (parentRef: any, defaultPadding: number = 0) => {
  const innerwidth = parentRef.current ? parentRef.current.offsetWidth : defaultPadding

  return innerwidth
}
