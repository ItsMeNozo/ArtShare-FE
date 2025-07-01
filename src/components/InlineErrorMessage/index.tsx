import { FormHelperText } from '@mui/material';
import { memo } from 'react';
import { MdErrorOutline } from 'react-icons/md';

const InlineErrorMessage = ({ errorMsg }: { errorMsg: string }) => {
  return (
    <FormHelperText error className="flex items-start pt-2">
      <MdErrorOutline
        size="1.5em"
        style={{
          marginRight: '0.4em',
        }}
      />
      {errorMsg}
    </FormHelperText>
  );
};

export default memo(InlineErrorMessage);
