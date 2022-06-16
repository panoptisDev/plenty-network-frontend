import Image from 'next/image';
import * as React from 'react';

export interface ISideBarProps {
}

export interface ISingleSideBarProps {
    name:string;
    iconName:string;
    pathName?:string;
    subMenu?:ISingleSideBarProps[] | false;
    className?:string;
    onClick?: () => void | Promise<void>;
    isMenuOpen?:boolean;
}

export function SingleSideBar (props: ISingleSideBarProps) {
  

  return (
    <div className={`flex flex-col ${props?.className}`} onClick={props.onClick} >
         <div className={`flex w-full justify-between py-3.5 px-6 text-gray-300 hover:text-gray-500 cursor-pointer items-center  hover:bg-sideBarHover border-x-2 border border-transprent hover:border-r-primary-500 `} >

             <div className='flex gap-4'>
                <Image src={'/assets/icon/swap.svg'} height={'11.67px'} width={'16.66px'}  />
                <p>{props.name}</p>
             </div>
             {props.subMenu && props.subMenu.length &&
             <Image src={props.isMenuOpen?'/assets/icon/UpArrow.svg':'/assets/icon/DownArrow.svg'} height={'8px'} width={'11px'}  />
             }

             
    </div>
    {props.subMenu && props.isMenuOpen && props.subMenu.length && 
             
             <div>
             {props.subMenu.map((submenuItem,index)=><SingleSideBar
              name={submenuItem.name}
              iconName={submenuItem.iconName}
              className='ml-4 border-l-2 border-muted-border'
              key={`submenu_${index}`}
              />)}
              
              </div>
              }
    </div>

  );
}


export interface IHrefIconProps {
   name:string;
   href:string;
   iconName:string;
}

export function HrefIcon (props: IHrefIconProps) {
  return (
    <div>
          <a 
          href={props.href}
          target='_blank'
          rel="noreferrer"
          className="flex w-full justify-between py-3.5 px-6 text-gray-300 hover:text-gray-500 cursor-pointer items-center  hover:bg-sideBarHover border-x-2 border border-transprent hover:border-r-primary-500" >
             <div className='flex gap-4'>
             <Image src={`/assets/icon/${props.iconName}.svg`} height={'11.67px'} width={'16.66px'}  />
             <p>{props.name}</p>
             </div>
             <Image src={'/assets/icon/HrefIcon.svg'} height={'11.67px'} width={'16.66px'}  />

          </a>
    </div>
  );
}

const FooterMenu:Array<IHrefIconProps>=[
    {
        name:'Analytic',
        iconName:'VectorfooterMenu',
        href:'https://google.com'
    },
    {
        name:'Docs',
        iconName:'VectorfooterMenu-1',
        href:'https://google.com'
    },
    {
        name:'Feedback',
        iconName:'VectorfooterMenu-2',
        href:'https://google.com'
    }
]

const MainMenu:Array<ISingleSideBarProps>=[
    {
        name:'komm',
        iconName:'swap',
        pathName:'./limk',
        subMenu:[
            {
                name:'swap',
                iconName:'swap',
                pathName:'./limk',
            },
            {
                name:'sap',
                iconName:'swap',
                pathName:'./limk',
            },
            {
                name:'swap',
                iconName:'swap',
                pathName:'./limk',
            }
        ]
    },
    {
        name:'Earn',
        iconName:'swap',
        pathName:'./limk',
        subMenu:[
            {
                name:'swap',
                iconName:'swap',
                pathName:'./limk',
            }
        ]
    },
    {
        name:'kokmm',
        iconName:'swap',
        pathName:'./limk',
    },{
        name:'mopp',
        iconName:'swap',
        pathName:'./limk',
    },
    
]

export function SideBar (props: ISideBarProps) {
    const [activeMenu,setActiveMenu]=React.useState<string>('');
  return (
    
    <div className="fixed sm:relative text-f14 bg-sideBar shadow  " style={{height:'calc(100vh - 64px)',width: '240px',marginTop:'64px'}} >
                 <div className='flex-col justify-between h-full flex overflow-y-auto'>
                    <div className=" border-muted-border border-b-2 ">
                        {MainMenu.map((menuItem,index)=>
                        <SingleSideBar
                          name={menuItem.name}
                          iconName={menuItem.iconName}
                          key={`menuItem${index}`}
                          onClick={()=>activeMenu===`menuItem${index}`?setActiveMenu(''):setActiveMenu(`menuItem${index}`)}
                          isMenuOpen={activeMenu===`menuItem${index}`}
                          subMenu={menuItem.subMenu?menuItem.subMenu:false}
                        />)}
                    </div>
                    

                    <div >
                        <div className=" border-muted-border border-b-2 border-t-2">
                        {FooterMenu.map((e,i)=><HrefIcon
                          name={e.name}
                          href={e.href}
                          key={`footer_${i}`}
                          iconName={e.iconName}
                        />)}
                        </div>
                        <div className="px-8 border-t border-muted-border ">
                        <ul className="w-full flex items-center justify-between ">
                            <li className="cursor-pointer   p-2   rounded-md border border-muted-border hover:translate-y-1 hover:border-muted-50">
                            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.9998 1.56151C13.485 1.79783 12.9319 1.9575 12.3505 2.02967C12.9504 1.65782 13.3992 1.07257 13.6132 0.383127C13.0496 0.72993 12.4327 0.974042 11.7894 1.10485C11.3568 0.626382 10.7838 0.309247 10.1594 0.20268C9.53498 0.0961129 8.89406 0.206076 8.33615 0.515498C7.77824 0.824919 7.33456 1.31649 7.07399 1.91388C6.81341 2.51128 6.75052 3.18108 6.89509 3.81929C5.75301 3.75989 4.63575 3.45239 3.61582 2.91676C2.59589 2.38112 1.69608 1.62932 0.974795 0.710137C0.728167 1.15083 0.586357 1.66179 0.586357 2.20595C0.586082 2.69583 0.702538 3.1782 0.925394 3.61027C1.14825 4.04233 1.47062 4.41074 1.86389 4.6828C1.4078 4.66777 0.961769 4.54011 0.562927 4.31044V4.34876C0.562881 5.03583 0.792311 5.70176 1.21229 6.23354C1.63226 6.76533 2.21692 7.13022 2.86704 7.26631C2.44394 7.38492 2.00036 7.40239 1.56978 7.3174C1.75321 7.90859 2.11051 8.42555 2.59166 8.79593C3.07282 9.1663 3.65373 9.37155 4.25309 9.38293C3.23565 10.2103 1.97912 10.6591 0.685624 10.6571C0.456496 10.6572 0.227561 10.6433 0 10.6156C1.31297 11.4901 2.84136 11.9542 4.4023 11.9524C9.68629 11.9524 12.5749 7.41896 12.5749 3.48717C12.5749 3.35943 12.5718 3.23041 12.5663 3.10268C13.1282 2.68176 13.6132 2.16054 13.9986 1.56343L13.9998 1.56151Z" fill="#9F9DA3"/>
                            </svg>

                            </li>
                            <li className="cursor-pointer   p-2 border  rounded-md border-muted-border hover:translate-y-1 hover:border-muted-50">
                            <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.5446 1.24235C12.5246 0.787322 11.4313 0.451 10.288 0.259758C10.2778 0.257824 10.2673 0.25907 10.2579 0.263324C10.2484 0.267577 10.2406 0.274628 10.2354 0.283498C10.0954 0.526837 9.93937 0.844035 9.83004 1.09463C8.61747 0.915412 7.38471 0.915412 6.17214 1.09463C6.05037 0.816905 5.91305 0.546109 5.76082 0.283498C5.75566 0.274518 5.74785 0.267309 5.73844 0.262831C5.72903 0.258354 5.71847 0.256821 5.70816 0.258439C4.56552 0.449681 3.47222 0.786003 2.45158 1.24169C2.4428 1.24533 2.43536 1.25154 2.43025 1.25949C0.355643 4.2765 -0.213007 7.21899 0.0663185 10.1245C0.0670958 10.1317 0.0693288 10.1385 0.0728816 10.1448C0.0764344 10.151 0.0812327 10.1565 0.0869846 10.1608C1.29788 11.0329 2.64847 11.6972 4.0822 12.126C4.0922 12.129 4.10289 12.129 4.11288 12.126C4.12287 12.1229 4.13169 12.1169 4.1382 12.1088C4.44672 11.7007 4.72012 11.2677 4.95551 10.8143C4.95878 10.8081 4.96066 10.8013 4.96103 10.7943C4.9614 10.7874 4.96025 10.7804 4.95766 10.7739C4.95507 10.7674 4.9511 10.7615 4.94601 10.7566C4.94092 10.7518 4.93484 10.7481 4.92818 10.7458C4.49753 10.5853 4.08026 10.3917 3.68021 10.1667C3.67303 10.1627 3.66697 10.1569 3.66259 10.15C3.6582 10.143 3.65563 10.1351 3.6551 10.127C3.65457 10.1188 3.65611 10.1106 3.65956 10.1032C3.66301 10.0957 3.66827 10.0892 3.67488 10.0843C3.75888 10.023 3.84288 9.95902 3.92287 9.89505C3.93007 9.8893 3.93875 9.88564 3.94793 9.88447C3.95711 9.88331 3.96644 9.88469 3.97487 9.88846C6.5928 11.0517 9.42805 11.0517 12.0153 9.88846C12.0238 9.88447 12.0332 9.88291 12.0425 9.88396C12.0518 9.885 12.0606 9.88862 12.068 9.89439C12.148 9.95902 12.2313 10.023 12.316 10.0843C12.3226 10.0891 12.328 10.0955 12.3315 10.1029C12.3351 10.1103 12.3368 10.1184 12.3364 10.1266C12.336 10.1348 12.3335 10.1427 12.3293 10.1497C12.325 10.1567 12.3191 10.1626 12.312 10.1667C11.9133 10.3936 11.4987 10.5855 11.0633 10.7451C11.0566 10.7475 11.0506 10.7513 11.0455 10.7562C11.0404 10.7611 11.0364 10.767 11.0338 10.7736C11.0312 10.7801 11.0301 10.7872 11.0305 10.7942C11.0308 10.8012 11.0327 10.8081 11.036 10.8143C11.276 11.2674 11.5507 11.6987 11.8526 12.1082C11.8589 12.1166 11.8677 12.1229 11.8777 12.1262C11.8877 12.1295 11.8985 12.1296 11.9086 12.1266C13.3448 11.6991 14.6976 11.0344 15.9099 10.1608C15.9158 10.1567 15.9207 10.1514 15.9244 10.1453C15.9281 10.1391 15.9304 10.1323 15.9312 10.1252C16.2645 6.76594 15.3725 3.84719 13.5653 1.26081C13.5608 1.25241 13.5535 1.24585 13.5446 1.24235ZM5.34683 8.35523C4.55886 8.35523 3.90887 7.65027 3.90887 6.78572C3.90887 5.92052 4.54619 5.21622 5.34683 5.21622C6.15348 5.21622 6.79746 5.92645 6.78479 6.78572C6.78479 7.65093 6.14748 8.35523 5.34683 8.35523ZM10.6633 8.35523C9.8747 8.35523 9.22539 7.65027 9.22539 6.78572C9.22539 5.92052 9.86203 5.21622 10.6633 5.21622C11.47 5.21622 12.114 5.92645 12.1013 6.78572C12.1013 7.65093 11.4707 8.35523 10.6633 8.35523Z" fill="#9F9DA3"/>
                            </svg>

                            </li>
                            <li className="cursor-pointer   p-2 border  rounded-md border-muted-border hover:translate-y-1 hover:border-muted-50">
                            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.03266 4.64596C9.03266 7.07306 7.01488 9.04112 4.52462 9.04112C3.93353 9.04189 3.34808 8.92882 2.80169 8.70835C2.25529 8.48789 1.75866 8.16436 1.34014 7.75624C0.921624 7.34811 0.589418 6.86337 0.362493 6.32971C0.135567 5.79605 0.0183647 5.22391 0.0175781 4.64596C0.0175781 2.21788 2.03536 0.250799 4.52462 0.250799C5.11579 0.2499 5.70135 0.362879 6.24786 0.583282C6.79437 0.803685 7.29112 1.1272 7.70975 1.53534C8.12837 1.94348 8.46066 2.42826 8.68765 2.96198C8.91464 3.49571 9.03188 4.06793 9.03266 4.64596ZM13.9772 4.64596C13.9772 6.93144 12.9683 8.78327 11.7237 8.78327C10.4791 8.78327 9.47018 6.93047 9.47018 4.64596C9.47018 2.36048 10.4791 0.508648 11.7237 0.508648C12.9683 0.508648 13.9772 2.36145 13.9772 4.64596ZM16 4.64596C16 6.69313 15.6454 8.35254 15.2069 8.35254C14.7694 8.35254 14.4147 6.69215 14.4147 4.64596C14.4147 2.59879 14.7694 0.939374 15.2079 0.939374C15.6454 0.939374 16 2.59879 16 4.64596Z" fill="#9F9DA3"/>
                            </svg>

                            </li>
                            <li className="cursor-pointer   p-2  border rounded-md border-muted-border hover:translate-y-1 hover:border-muted-50">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00073 0.684875C3.85698 0.684875 0.500732 4.04113 0.500732 8.18488C0.500732 11.5036 2.64761 14.3068 5.62886 15.3005C6.00386 15.3661 6.14448 15.1411 6.14448 14.9443C6.14448 14.7661 6.13511 14.1755 6.13511 13.5474C4.25073 13.8943 3.76323 13.088 3.61323 12.6661C3.52886 12.4505 3.16323 11.7849 2.84448 11.6068C2.58198 11.4661 2.20698 11.1193 2.83511 11.1099C3.42573 11.1005 3.84761 11.6536 3.98823 11.8786C4.66323 13.013 5.74136 12.6943 6.17261 12.4974C6.23823 12.0099 6.43511 11.6818 6.65073 11.4943C4.98198 11.3068 3.23823 10.6599 3.23823 7.79113C3.23823 6.9755 3.52886 6.3005 4.00698 5.7755C3.93198 5.588 3.66948 4.81925 4.08198 3.788C4.08198 3.788 4.71011 3.59113 6.14448 4.55675C6.74448 4.388 7.38198 4.30363 8.01948 4.30363C8.65698 4.30363 9.29448 4.388 9.89448 4.55675C11.3289 3.58175 11.957 3.788 11.957 3.788C12.3695 4.81925 12.107 5.588 12.032 5.7755C12.5101 6.3005 12.8007 6.96613 12.8007 7.79113C12.8007 10.6693 11.0476 11.3068 9.37886 11.4943C9.65073 11.7286 9.88511 12.1786 9.88511 12.8818C9.88511 13.8849 9.87573 14.6911 9.87573 14.9443C9.87573 15.1411 10.0164 15.3755 10.3914 15.3005C11.8802 14.7979 13.174 13.841 14.0906 12.5645C15.0071 11.2881 15.5003 9.75632 15.5007 8.18488C15.5007 4.04113 12.1445 0.684875 8.00073 0.684875Z" fill="#9F9DA3"/>
                            </svg>

                            </li>
                        </ul>
                        </div>
                        
                    </div>
                </div>
                </div>
  );
}
