type Token = {
    symbol: string;
    name: string;
    id: number;
  };
  
  type Tokens = {
    [key: string]: Token;
  };
  
  export const tokens: Tokens = {
    USDT: {
      symbol: "USDT",
      name: "USDT",
      id: 0,
    },
    CUSD: {
      symbol: "CUSD",
      name: "CUSD",
      id: 1,
    },
    CKES: {
      symbol: "CKES",
      name: "CKES",
      id: 2,
    },
    USDC: {
      symbol: "USDC",
      name: "USDC",
      id: 3,
    },
  };