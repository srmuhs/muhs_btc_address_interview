import React, { ChangeEvent } from "react";
import {
  ToggleButtonGroup,
  ToggleButton,
  ToggleButtonGroupProps,
  ToggleButtonProps
} from "@mui/material";

interface Option {
  value: any;
  label: React.ReactNode;
}

interface ToggleProps {
  options: Option[];
  onChange: (value: any) => void;
  currentValue: any;
  toggleGroupProps?: ToggleButtonGroupProps;
  toggleButtonProps?: ToggleButtonProps;
}

export const Toggle: React.FC<ToggleProps> = ({
  options,
  onChange,
  currentValue,
  toggleGroupProps,
  toggleButtonProps
}) => {
  const handleToggleChange = (event: ChangeEvent<{}>, value: any) =>
    onChange(value);

  return (
    <ToggleButtonGroup
      value={currentValue}
      exclusive
      onChange={handleToggleChange}
      aria-label="Filter"
      {...toggleGroupProps}
    >
      {options.map(option =>
        <ToggleButton
          style={{ width: "50px", padding: "5px" }}
          key={option.value}
          value={option.value}
          {...toggleButtonProps}
        >
          {option.label}
        </ToggleButton>
      )}
    </ToggleButtonGroup>
  );
};

export default Toggle;
