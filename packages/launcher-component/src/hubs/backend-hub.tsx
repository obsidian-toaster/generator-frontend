import { CapabilitiesPicker, CapabilitiesPickerValue } from '../pickers/capabilities-picker';
import { DescriptiveHeader, Separator, SpecialValue } from '../core/stuff';
import * as React from 'react';
import { RuntimePicker, RuntimePickerValue } from '../pickers/runtime-picker';
import { EnumsRuntimesLoaders, RuntimeLoader } from '../loaders/enums-runtimes-loaders';
import { CapabilitiesByModuleLoader, CapabilitiesLoader, capabilityToItem } from '../loaders/capabilities-loader';
import { FormPanel } from '../core/form-panel/form-panel';
import { FormHub } from '../core/types';
import { Button, EmptyState, EmptyStateBody, List, ListItem, Split, SplitItem, Text, TextVariants, Title } from '@patternfly/react-core';
import { OverviewComplete } from '../core/hub-n-spoke/overview-complete';

export interface BackendFormValue {
  runtimePickerValue?: RuntimePickerValue;
  capabilitiesPickerValue?: CapabilitiesPickerValue;
}

export const BackendHub: FormHub<BackendFormValue> = {
  checkCompletion: value => {
    return !!value.runtimePickerValue && RuntimePicker.checkCompletion(value.runtimePickerValue)
      && !!value.capabilitiesPickerValue && CapabilitiesPicker.checkCompletion(value.capabilitiesPickerValue);
  },
  Overview: props => {
    if (!BackendHub.checkCompletion(props.value)) {
      return (
        <EmptyState>
          <Title size="lg">You can select a Backend for your custom application</Title>
          <EmptyStateBody>
            By selecting a bunch of capabilities (Http Api, Database, ...), you will be able to bootstrap the backend of
            your application in a few seconds...
          </EmptyStateBody>
          <Button variant="primary" onClick={props.onClick}>Configure a Backend</Button>
        </EmptyState>
      );
    }
    return (
      <RuntimeLoader id={props.value.runtimePickerValue!.id!}>
        {runtime => (
          <OverviewComplete title={`Your ${runtime!.name} backend is configured`}>
            <Split>
              <SplitItem isMain={false}>
                <img src={runtime!.icon} style={{marginRight: '20px', height: '75px'}}/>
              </SplitItem>
              <SplitItem isMain={true}>
                <CapabilitiesByModuleLoader categories={['backend', 'support']}>
                  {capabilitiesById => (
                    <div style={{textAlign: 'left'}}>
                      <Text component={TextVariants.p} style={{marginBottom: '10px'}}>Featuring</Text>
                      <List variant="grid" style={{listStyleType: 'none'}}>
                        {props.value.capabilitiesPickerValue!.capabilities!.filter(c => c.selected)
                          .map(c => (
                              <ListItem key={c.id}>
                                <img
                                  src={capabilitiesById.get(c.id)!.metadata.icon}
                                  style={{marginRight: '10px', verticalAlign: 'middle'}}
                                />
                                <SpecialValue>{capabilitiesById.get(c.id)!.name}</SpecialValue>
                              </ListItem>
                            )
                          )
                        }
                      </List>
                    </div>
                  )}
                </CapabilitiesByModuleLoader>
              </SplitItem>
            </Split>
          </OverviewComplete>
        )}
      </RuntimeLoader>
    );
  },
  Form: props => {
    return (
      <FormPanel
        initialValue={props.initialValue}
        // We don't check completion because no backend (with a frontend) is valid
        onSave={props.onSave}
        onCancel={props.onCancel}
      >
        {
          (inputProps) => (
            <React.Fragment>
              <DescriptiveHeader
                title="Runtime"
                description="Runtimes power the server-side processing of your application,
                       and we can get you set up in one of several languages and frameworks.
                       If you're looking to expose an HTTP API or interact with services like a database,
                       choosing one here will hook that together for you."
              />
              <EnumsRuntimesLoaders category="backend">
                {(items) => (
                  <RuntimePicker.Element
                    items={items}
                    value={inputProps.value.runtimePickerValue || {}}
                    onChange={(runtimePickerValue) => inputProps.onChange({...inputProps.value, runtimePickerValue})}
                  />
                )}
              </EnumsRuntimesLoaders>
              {inputProps.value.runtimePickerValue && RuntimePicker.checkCompletion(inputProps.value.runtimePickerValue) && (
                <React.Fragment>
                  <Separator/>
                  <DescriptiveHeader
                    title="Capabilities"
                    description="Capabilities specify what your application can do.
     Select from the below, and we'll wire your application code,
     services, and OpenShift together end-to-end. When done, our friendly Welcome Application will show you how
     everything works."
                  />
                  <CapabilitiesLoader categories={['backend']}>
                    {(capabilities) => (
                      <CapabilitiesPicker.Element
                        items={capabilities.map(capabilityToItem)}
                        value={inputProps.value.capabilitiesPickerValue || {}}
                        onChange={(capabilitiesPickerValue) => inputProps.onChange({...inputProps.value, capabilitiesPickerValue})}
                      />
                    )}
                  </CapabilitiesLoader>
                </React.Fragment>
              )}
            </React.Fragment>
          )}
      </FormPanel>
    );
  }
};
