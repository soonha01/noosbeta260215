import React from 'react';
import { Check } from 'lucide-react';
import { StatusItem, StatusList, StatusMark } from './TravelGenerationPage.styles';

const TravelGenerationStatusList = ({ accentColor, activeStatusIndex, statusLines }) => (
  <StatusList>
    {statusLines.map((line, index) => {
      const active = index <= activeStatusIndex;

      return (
        <StatusItem key={`${line}-${index}`} $active={active} $accent={accentColor}>
          <StatusMark $active={active} $accent={accentColor}>
            {active ? <Check size={16} /> : index + 1}
          </StatusMark>
          {line}
        </StatusItem>
      );
    })}
  </StatusList>
);

export default React.memo(TravelGenerationStatusList);
