export const treeDropData = [
  {
    name: "Port A - This is the main port in the northern region with significant traffic and operations",
    id: 22,
    children: [
      {
        name: "Port C - A key sub-port with heavy container traffic in the southern bay area",
        id: 1,
        children: [
          {
            name: "Port G - A small port used for local shipments and fishing operations",
            id: 2,
            children: [
              {
                name: "Port H - A minor local port focusing on fisheries and small-scale cargo",
                id: 3,
                children: [],
              },
            ],
          },
          {
            name: "Port I - A coastal port for regional trade and tourism operations",
            id: 4,
            children: [
              {
                name: "Port J - A harbor for tourist cruises and commercial boats",
                id: 5,
                children: [],
              },
            ],
          },
        ],
      },
      {
        name: "Port D - An industrial port dealing with large-scale cargo and ship repair services",
        id: 6,
        children: [
          {
            name: "Port K - A dock specializing in shipbuilding and marine repairs",
            id: 7,
            children: [
              {
                name: "Port L - A repair facility for both military and commercial vessels",
                id: 8,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Port B - This is the largest port in the central region, supporting international trade",
    id: 9,
    children: [
      {
        name: "Port E - A primary export port dealing with raw materials and heavy goods",
        id: 10,
        children: [
          {
            name: "Port M - A small export hub for agricultural and mining products",
            id: 11,
            children: [
              {
                name: "Port N - A warehouse and storage center for exported goods",
                id: 12,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
];
