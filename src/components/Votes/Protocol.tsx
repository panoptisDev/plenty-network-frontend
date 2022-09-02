import { Dropdown } from '../DropDown/Dropdown';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';

function Protocol(props:{isSelected:boolean,setSelectedDropDown:Function,selectedDropDown:any}) {
  console.log("props.isSelected",props.isSelected)
  let Options=['My votes', 'Protocol'];
   if(!props.isSelected){
     Options=[];
   }
  return (
    <div>
      <Dropdown
        isDisabled={!props.isSelected}
        title="Protocol"
        Options={Options}
        selectedText={props.selectedDropDown}
        onClick={props.setSelectedDropDown}
        className='bg-muted-500 border border-muted-300 rounded-lg'
      />
    </div>
  );
}

export default Protocol;
