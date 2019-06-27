import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { formatDate, parseDate } from 'react-day-picker/moment';

export default function Example(props) {
  return (
    <DayPickerInput
      inputProps={ {name: props.name} }
      formatDate={formatDate}
      format="YYYY-MM-D"
      parseDate={parseDate}
      placeholder={`${formatDate(new Date(), 'YYYY-MM-D')}`} />
   );
}