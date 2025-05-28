import * as React from "react"
import Svg, { Path } from "react-native-svg"

const HomeIcon = (props: any) => (
    <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={31}
    height={31}
    fill="none"
    {...props}
  >
    <Path
      fill="#C9CACB"
      d="M16.81 5.323a1.649 1.649 0 0 0-2.024-.006l-8.877 6.86a.824.824 0 0 0-.32.65L5.55 26.18a.825.825 0 0 0 .822.827l5.36.015a.825.825 0 0 0 .827-.822l.02-7.154a.824.824 0 0 1 .827-.822l4.708.014a.824.824 0 0 1 .822.826l-.02 7.154a.824.824 0 0 0 .822.826l5.36.016a.824.824 0 0 0 .827-.823l.038-13.353a.824.824 0 0 0-.317-.652l-8.838-6.91Z"
    />
  </Svg>
)

export default HomeIcon