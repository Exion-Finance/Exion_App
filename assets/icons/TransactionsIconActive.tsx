import * as React from "react"
import Svg, { Path } from "react-native-svg"

const TransactionsIconActive = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={21}
    fill="none"
    {...props}
  >
    <Path
      fill="#00C48F"
      fillRule="evenodd"
      d="M5 18.569C5 19.906 4.425 21 3.72 21H1.28C.576 21 0 19.906 0 18.569V13.43C0 12.093.576 11 1.28 11h2.44C4.426 11 5 12.093 5 13.431v5.138M12 18.916C12 20.062 11.424 21 10.72 21H8.28C7.576 21 7 20.062 7 18.916V5.085C7 3.938 7.576 3 8.28 3h2.44c.704 0 1.28.938 1.28 2.085v13.831M19 18.873c0 1.17-.576 2.127-1.28 2.127h-2.44c-.704 0-1.28-.957-1.28-2.127V9.128C14 7.958 14.576 7 15.28 7h2.44c.704 0 1.28.957 1.28 2.128v9.745M26 18.94c0 1.134-.607 2.06-1.35 2.06h-2.3c-.743 0-1.35-.926-1.35-2.06V2.06C21 .928 21.607 0 22.35 0h2.3C25.394 0 26 .927 26 2.06v16.88"
      clipRule="evenodd"
    />
  </Svg>
)
export default TransactionsIconActive