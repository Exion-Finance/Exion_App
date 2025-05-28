import * as React from "react"
import Svg, { Path } from "react-native-svg"

const Edit = (props: any) => (
    <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    {...props}
  >
    <Path
      stroke="#00C48F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14.425 6.278 17.16 9.06m-4.559 10.203h7.294m-14.588-3.71-.912 3.71 3.647-.927L18.606 7.589c.342-.348.534-.82.534-1.311 0-.492-.192-.964-.534-1.312l-.157-.16a1.808 1.808 0 0 0-1.289-.543c-.483 0-.947.196-1.29.543L5.308 15.553Z"
    />
  </Svg>
)

export default Edit