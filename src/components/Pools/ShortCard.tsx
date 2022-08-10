import * as React from 'react';
import { Column } from 'react-table';
import { usePoolsMain } from '../../api/pools/query/poolsmain.query';
import { poolsMainPage, Token1 } from '../../api/pools/types';
import { useTableNumberUtils } from '../../hooks/useTableUtils';
import Table from '../Table/Table';
import { CircularImageInfo } from './Component/CircularImageInfo';
import { ShortCardHeader } from './ShortCardHeader';
import { ShortCardList } from './ShortCardList';
import token from '../../assets/Tokens/plenty.png';
import token2 from '../../assets/Tokens/ctez.png';
import { ManageLiquidity } from './ManageLiquidity';
import { tokenParameter } from '../../constants/swap';
import { tokenParameterLiquidity } from '../Liquidity/types';

export interface IShortCardProps {
  className?: string;
}

export function ShortCard(props: IShortCardProps) {
  const { valueFormat } = useTableNumberUtils();
  const { data: poolsTableData = [] } = usePoolsMain();
  const [showLiquidityModal, setShowLiquidityModal] = React.useState(false);
  const [tokenIn, setTokenIn] = React.useState<tokenParameterLiquidity>({
    name: 'USDC.e',
    image: `/assets/tokens/USDC.e.png`,
    symbol: 'USDC.e',
  });
  const [tokenOut, setTokenOut] = React.useState<tokenParameterLiquidity>({
    name: 'USDT.e',
    image: `/assets/tokens/USDC.e.png`,
    symbol: 'USDT.e',
  });
  const getImagesPath = (name: string, isSvg?: boolean) => {
    if (isSvg) return `/assets/tokens/${name}.svg`;
    if (name) return `/assets/tokens/${name.toLowerCase()}.png`;
    else return '';
  };
  const columns = React.useMemo<Column<poolsMainPage>[]>(
    () => [
      {
        Header: 'Pools',
        id: 'pools',
        accessor: (x) => (
          <div className="flex gap-2 items-center max-w-[153px]">
            <CircularImageInfo
              imageArray={[
                getImagesPath(x.token1.symbol),
                getImagesPath(x.token2.symbol),
              ]}
            />
            <div className="flex flex-col gap-[2px]">
              <span className="text-f14 text-white uppercase">
                {x.token1.symbol}/{x.token2.symbol}
              </span>
              <span className="text-f12 text-text-500">Stable Pool</span>
            </div>
          </div>
        ),
      },
      {
        Header: 'APR',
        id: 'apr',
        subText: 'current Epoch',
        isToolTipEnabled: true,
        canShort: true,
        accessor: (x) => (
          <p className="max-w-[115px] overflow-hidden ">{x.apr}</p>
        ),
      },
      {
        Header: 'Volume',
        id: 'Volume24h',
        subText: '24h',
        isToolTipEnabled: true,
        accessor: (x) => (
          <p className="max-w-[115px] overflow-hidden ">{x.token1.decimals}</p>
        ),
      },
      {
        Header: 'TVL',
        id: 'TVL',
        isToolTipEnabled: true,
        accessor: (x) => (
          <p className="max-w-[115px] overflow-hidden ">{x.apr}</p>
        ),
      },
      {
        Header: 'Fees',
        id: 'fees',
        subText: 'current epoch',
        isToolTipEnabled: true,
        accessor: (x) => (
          <p className="max-w-[115px] overflow-hidden ">{x.apr}</p>
        ),
      },
      {
        Header: 'Bribes',
        id: 'Bribes',
        isToolTipEnabled: true,
        accessor: (x) => (
          <p className="max-w-[115px] overflow-hidden ">{x.bribe}</p>
        ),
      },
      {
        Header: '',
        id: 'lools',
        minWidth: 151,
        accessor: (x) => (
          <div
            className="bg-primary-500/10 cursor-pointer  text-primary-500 px-7 py-2 rounded-lg"
            onClick={() => {
              setShowLiquidityModal(true);
              setTokenIn({
                name: 'USDC.e',
                image: `/assets/tokens/USDC.e.png`,
                symbol: 'USDC.e',
              });
              setTokenOut({
                name: 'USDT.e',
                image: `/assets/tokens/USDC.e.png`,
                symbol: 'USDT.e',
              });
            }}
          >
            Manage
          </div>
        ),
      },
    ],
    [valueFormat]
  );

  return (
    <>
      {showLiquidityModal && (
        <ManageLiquidity
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          closeFn={setShowLiquidityModal}
        />
      )}
      <div className={`w-full ${props.className}`}>
        <Table<any> columns={columns} data={poolsTableData} />
      </div>
    </>
  );
}
