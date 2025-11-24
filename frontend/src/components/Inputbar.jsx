import { Input } from '@chakra-ui/react';
import React from 'react';

const Inputbar = ({ value, setValue,label}) => (
  <Input
    placeholder={label}
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
);

export default Inputbar;
