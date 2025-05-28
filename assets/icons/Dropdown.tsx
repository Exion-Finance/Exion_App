import * as React from "react"
import Svg, { Path } from "react-native-svg"
const DropDown = (props: any) => (
    <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={10}
        height={7}
        fill="none"
        {...props}
    >
        <Path
            fill="#fff"
            d="M1.065 0A1 1 0 0 0 .28 1.62l3.6 4.557a1 1 0 0 0 1.57 0l3.6-4.557A1 1 0 0 0 8.265 0h-7.2Z"
        />
    </Svg>
)
export default DropDown