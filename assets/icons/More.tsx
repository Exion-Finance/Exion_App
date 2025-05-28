import * as React from "react"
import Svg, { Path } from "react-native-svg"
const More = (props: any) => (
    <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={25}
        height={7}
        fill="none"
        {...props}
    >
        <Path
            fill="#C9CACB"
            fillRule="evenodd"
            d="M3.5 0A3.51 3.51 0 0 0 0 3.5 3.51 3.51 0 0 0 3.5 7 3.51 3.51 0 0 0 7 3.5 3.51 3.51 0 0 0 3.5 0Zm18 0A3.51 3.51 0 0 0 18 3.5 3.51 3.51 0 0 0 21.5 7 3.51 3.51 0 0 0 25 3.5 3.51 3.51 0 0 0 21.5 0ZM9 3.5A3.51 3.51 0 0 1 12.5 0 3.51 3.51 0 0 1 16 3.5 3.51 3.51 0 0 1 12.5 7 3.51 3.51 0 0 1 9 3.5Z"
            clipRule="evenodd"
        />
    </Svg>
)
export default More