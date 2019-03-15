import * as React from 'react';
import { useState } from 'react';
import { Button, Toolbar, ToolbarGroup } from '@patternfly/react-core';
import { InputProps } from '../types';
import { Separator } from '../stuff';

interface FormPanelProps<T> {
  initialValue: T;
  validator?(value: T): boolean;
  children(inputProps: InputProps<T>): any;
  onSave?(value: T);
  onCancel?();
}

export function FormPanel<T>(props: FormPanelProps<T>) {
  const [value, onChange] = useState<T>(props.initialValue);

  const onSave = () => {
    if (props.onSave) {
      props.onSave(value);
    }
  };

  const onCancel = () => {
    onChange(props.initialValue);
    if (props.onCancel) {
      props.onCancel();
    }
  };
  return (
    <div className="form-panel" style={{padding: '20px'}}>
      {props.children({value, onChange})}
      <Separator/>
      <Toolbar>
        <ToolbarGroup>
          <Button variant="primary" onClick={onSave} isDisabled={props.validator && !props.validator(value)}>Save</Button>
        </ToolbarGroup>
        <ToolbarGroup>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
}
