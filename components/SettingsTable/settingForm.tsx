import React, { useState } from 'react';
import { Label, Input, ListGroup, ListGroupItem } from 'reactstrap';
import InputRange from 'react-input-range';
import { Range } from '@vocab/shared';
import { SettingsItem } from './SettingsTable';

interface Props {
  setSetting: Function;
  info: SettingsItem;
}

export const SettingForm = (props: Props) => {
  const { setSetting, info } = props;
  const [value, setValue] = useState<number>(info.value as number);

  const sentSettings = (value: string | number) => {
    setSetting({ [info.tag]: value });
  };

  const handlerChange = (e: React.FormEvent<HTMLInputElement>) => {
    sentSettings(e.currentTarget.value);
  };

  if (!info.isList) {
    const { min, max, step, divider } = info.options as Range;

    return (
      <div className="m-4">
        <InputRange
          maxValue={max as number}
          minValue={min as number}
          step={step as number}
          value={value}
          formatLabel={(value) => `${value} ${info.optionsType}`}
          onChange={(value) => setValue(value as number)}
          onChangeComplete={(value) =>
            sentSettings((value as number) * (divider as number))
          }
        />
      </div>
    );
  }

  if (info.options instanceof Array) {
    return (
      <ListGroup flush>
        {info.options.map((item, index) => (
          <ListGroupItem key={index}>
            <Label check>
              <Input
                type="radio"
                name={info.tag}
                defaultChecked={info.value === item}
                value={item}
                onChange={handlerChange}
              />
              {item}
            </Label>
          </ListGroupItem>
        ))}
      </ListGroup>
    );
  }

  return (
    <ListGroup flush>
      {Object.entries(info.options).map(([key, value], index) => (
        <ListGroupItem key={index}>
          <Label check>
            <Input
              type="radio"
              name={info.tag}
              defaultChecked={info.value === key}
              value={key}
              onChange={handlerChange}
            />
            {value}
          </Label>
        </ListGroupItem>
      ))}
    </ListGroup>
  );
};
