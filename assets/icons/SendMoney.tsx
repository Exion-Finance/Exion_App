import * as React from "react"
import Svg, { Path } from "react-native-svg"
const SendMoney = (props: any) => (
    <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={21}
        height={19}
        fill="none"
        {...props}
    >
        <Path
            fill="#00C48F"
            d="M19.973 2.143C20.463.92 19.15-.263 17.791.18L1.202 5.58C-.159 6.023-.324 7.696.93 8.35l5.295 2.758 4.728-4.255c.215-.187.502-.29.8-.287.297.002.582.11.793.299.21.19.33.446.332.714a.97.97 0 0 1-.319.72L7.83 12.553l3.067 4.766c.724 1.128 2.583.978 3.076-.247l6-14.93Z"
        />
    </Svg>
)
export default SendMoney