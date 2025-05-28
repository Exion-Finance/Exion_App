import * as React from "react"
import Svg, { Path } from "react-native-svg"

const ProfileActive = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={31}
    height={31}
    fill="none"
    {...props}
  >
    <Path
      fill="#00C48F"
      fillRule="evenodd"
      d="M10.064 9.161a5 5 0 1 1 10 0 5 5 0 0 1-10 0Zm0 7.5a6.25 6.25 0 0 0-6.25 6.25 3.75 3.75 0 0 0 3.75 3.75h15a3.75 3.75 0 0 0 3.75-3.75 6.25 6.25 0 0 0-6.25-6.25h-10Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default ProfileActive