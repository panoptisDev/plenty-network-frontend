import axios from 'axios';
import Config from '../../config/config';
import { useAppSelector } from '../../redux';

export const fetchConfig = async () => {
    const token_response = await axios.get(Config.TOKEN_CONFIG);
    const amms_response = await axios.get(Config.AMM_CONFIG);

    const TOKEN :{ [x: string]: any } = token_response.data;
    const AMM : { [x: string]: any }  = amms_response.data;
    return {
        TOKEN: TOKEN,
        AMM: AMM,
    };
};

export const getDexAddress = (tokenIn: string, tokenOut: string): string => {
    const AMM = useAppSelector((state) => state.config.AMMs);
    let add = 'false';
    Object.keys(AMM).forEach(function (key) {
        if ((AMM[key].token1.symbol === tokenIn && AMM[key].token2.symbol === tokenOut) || (AMM[key].token2.symbol === tokenIn && AMM[key].token1.symbol === tokenOut)) {
            add = key;
            return key;
        }
    })
    return add;
}

