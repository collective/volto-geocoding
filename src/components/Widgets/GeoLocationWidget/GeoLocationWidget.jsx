import React, { useState, useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Grid, Form } from 'semantic-ui-react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import uniqBy from 'lodash.uniqby';
import { useCombobox } from 'downshift';

const messages = defineMessages({
  geolocation: {
    id: 'geolocation',
    defaultMessage: 'Geolocalizzazione',
  },
  geolocationPlaceholder: {
    id: 'geolocation_placeholder',
    defaultMessage: 'Cerca un luogo...',
  },
  geolocationNoResults: {
    id: 'geolocation_noresults',
    defaultMessage: 'No results for "{userInput}"',
  },
  geolocationSelected: {
    id: 'geolocation_selected',
    defaultMessage: 'Selezionato',
  },
});

const useDebouncedEffect = (effect, delay, deps) => {
  const callback = useCallback(effect, deps);

  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);
};

const OSMMap = ({ position, address, zoom = 15 }) => (
  <Map center={position} zoom={zoom} id="geocoded-result">
    <TileLayer
      attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={position}>
      <Popup>{address}</Popup>
    </Marker>
  </Map>
);

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
  };

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: searchSuggestions,
    onSelectedItemChange: ({ address, position: { lat, lng } }) =>
      onChange(id, { description: address, lat, lng }),
    onInputValueChange: ({ inputValue }) =>
      doSearch(inputValue, setSearchSuggestions),
  });

  // useDebouncedEffect(() => doSearch(), 600, [searchAddress]);

  return (
    <Form.Field inline required={required} id={id}>
      <Grid>
        <Grid.Row>
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
                <OSMMap
                  position={[value.lat, value.lng]}
                  address={value.description}
                />
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
                    onClick={() => onChange(id, {})}
                  />
                </div>
              </React.Fragment>
            ) : (
              <div
                className="autosuggest-address ui input"
                style={{ position: 'relative' }}
              >
                <div>
                  <label {...getLabelProps()}>Choose an element:</label>
                  <div className="combobox" {...getComboboxProps()}>
                    <input {...getInputProps()} />
                    <button
                      {...getToggleButtonProps()}
                      aria-label="toggle menu"
                    >
                      &#8595;
                    </button>
                  </div>
                  <ul {...getMenuProps()}>
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
