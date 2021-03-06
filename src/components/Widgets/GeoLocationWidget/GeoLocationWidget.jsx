import React, { useState, useRef, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Grid, Form } from 'semantic-ui-react';
import uniqBy from 'lodash.uniqby';
import debounce from 'lodash.debounce';
import { useCombobox } from 'downshift';

import { OSMMap } from '../../../';

import './GeoLocationWidget.css';

const messages = defineMessages({
  geolocation: {
    id: 'geolocation',
    defaultMessage: 'Geolocation',
  },
  geolocationPlaceholder: {
    id: 'geolocation_placeholder',
    defaultMessage: 'Search a venue...',
  },
  geolocationSelected: {
    id: 'geolocation_selected',
    defaultMessage: 'Selected',
  },
  geolocationClear: {
    id: 'geolocationClear',
    defaultMessage: 'Clear',
  },
});

const useDebouncedCallback = (callback, delay) => {
  const callbackRef = useRef();
  callbackRef.current = callback;

  return useCallback(
    debounce((...args) => callbackRef.current(...args), delay),
    [],
  );
};

const GeoLocationWidget = ({
  value,
  id,
  onChange,
  required,
  title,
  description,
}) => {
  const intl = useIntl();
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  const doSearch = async (searchAddress, setterCallback) => {
    if (searchAddress?.length > 0) {
      console.log(searchAddress);

      try {
        const response = await fetch(
          `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=${searchAddress}&outFields=Match_addr,Addr_type`,
        );
        const data = await response.json();
        const results = uniqBy(
          (data?.candidates ?? []).map(candidate => ({
            ...candidate,
            key: `${candidate.location?.y ?? 0} ${candidate.location?.x ?? 0}`,
          })),
          'key',
        );
        setterCallback(results);
      } catch (err) {
        console.error(err);
      }
    } else {
      setterCallback([]);
    }
  };

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    setInputValue,
  } = useCombobox({
    items: searchSuggestions,
    defaultInputValue: '',
    initialHighlightedIndex: 0,
    itemToString: item => item.address,
    onSelectedItemChange: ({ selectedItem: { address, location } }) => {
      onChange(id, { description: address, lat: location.y, lng: location.x });
      setInputValue('');
    },
    onInputValueChange: useDebouncedCallback(
      ({ inputValue }) => doSearch(inputValue, setSearchSuggestions),
      600,
    ),
  });

  return (
    <Form.Field inline required={required} id={id}>
      <Grid>
        <Grid.Row stretched>
          <Grid.Column width="4">
            <div className="wrapper">
              <label htmlFor="geolocation-search">
                {title ?? intl.formatMessage(messages.geolocation)}
              </label>
            </div>
          </Grid.Column>
          <Grid.Column width="8" className="geolocation-widget">
            {value && Object.keys(value).length > 0 ? (
              <React.Fragment>
                {__CLIENT__ && (
                  <OSMMap
                    position={[value.lat, value.lng]}
                    address={value.description}
                  />
                )}
                <div className="geolocation-selected-wrapper">
                  {value.description && (
                    <span className="geolocation-selected">
                      <small>
                        {`${intl.formatMessage(
                          messages.geolocationSelected,
                        )}: `}
                      </small>
                      {value.description}
                    </span>
                  )}
                  <Button
                    icon="trash"
                    size="mini"
                    title={intl.formatMessage(messages.geolocationClear)}
                    onClick={() => {
                      onChange(id, null);
                      setInputValue('');
                    }}
                  />
                </div>
              </React.Fragment>
            ) : (
              <div className="autosuggest-address ui input">
                <div className="combobox" {...getComboboxProps()}>
                  <input
                    {...getInputProps()}
                    type="text"
                    className="combobox-input"
                    placeholder={intl.formatMessage(
                      messages.geolocationPlaceholder,
                    )}
                  />
                </div>
                <ul {...getMenuProps()} className="combobox-listbox">
                  {isOpen &&
                    searchSuggestions.map((item, index) => (
                      <li
                        style={
                          highlightedIndex === index
                            ? { backgroundColor: '#bde4ff' }
                            : {}
                        }
                        key={`${item.location.x}${item.location.y}${index}`}
                        {...getItemProps({ item, index })}
                      >
                        {item.address}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </Grid.Column>
        </Grid.Row>
        {description && (
          <Grid.Row stretched>
            <Grid.Column stretched width="12">
              <p className="help">{description}</p>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </Form.Field>
  );
};

export default GeoLocationWidget;
