import * as React from "react"
import Svg, { Path } from "react-native-svg"
const BuyGoods = (props: any) => (
    <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={17}
    fill="none"
    {...props}
  >
    <Path
      stroke="#00C48F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.332 16H4.333A3.333 3.333 0 0 1 1 12.666v-10A1.667 1.667 0 0 1 2.667 1h8.332a1.666 1.666 0 0 1 1.667 1.667V13.5c0 1.38.286 2.5 1.666 2.5Z"
    />
    <Path
      stroke="#00C48F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 6.834a1.667 1.667 0 0 0-1.666-1.667h-1.667v8.75c0 1.15.517 2.083 1.667 2.083S16 15.067 16 13.917V6.834Z"
    />
    <Path
      stroke="#00C48F"
      strokeLinecap="round"
      strokeWidth={2}
      d="M9.332 7.666h-5m5-3.333h-5M6.832 11h-2.5"
    />
  </Svg>
)
export default BuyGoods