import * as React from 'react';
import 'jest-dom/extend-expect';
import { cleanup, fireEvent, render } from 'react-testing-library';
import { ImportExistingFlow, LauncherClientProvider } from '../..';
import { mockLauncherClient } from 'launcher-client';
import { flushPromises, launchCheckPayloadAndProgress } from './flow-helpers';

afterEach(() => {
  console.log('cleanup()');
  cleanup();
});

jest.useFakeTimers();

async function configureSrc(comp, url) {
  fireEvent.click(comp.getByLabelText('Open src-repository editor'));
  expect(comp.getByLabelText('Edit src-repository')).toBeDefined();

  fireEvent.change(comp.getByLabelText('Git repository url'), { target: { value: url } });
  fireEvent.click(comp.getByText('Done'));

  // Resolve fetch url
  await flushPromises();

  fireEvent.click(comp.getByText('Advanced settings'));
  expect(comp.getByLabelText('select-buildImage')).toBeDefined();

  fireEvent.click(comp.getByLabelText('Choose Java Code Builder'));

  fireEvent.change(comp.getByPlaceholderText('Type the environment variable name'), {target: {value: 'JAVA_DEBUG'}});
  fireEvent.change(comp.getByPlaceholderText('Type the environment variable value'), {target: {value: 'true'}});
  fireEvent.click(comp.getByLabelText('Save src-repository'));

  // Resolve overview promises
  await flushPromises();
}

describe('<ImportExistingFlow />', () => {
  it('renders and initializes the ImportExistingFlow correctly', async () => {
    const comp = render(<LauncherClientProvider><ImportExistingFlow /></LauncherClientProvider>);
    expect(comp.getByLabelText('openshift-deployment is not configured')).toBeDefined();

    // Resolve overview promises
    await flushPromises();
    await flushPromises();

    expect(comp.getByLabelText('openshift-deployment is configured')).toBeDefined();

    expect(comp.getByLabelText('Launch Application')).toHaveAttribute('disabled');
    expect(comp.getByLabelText('Download Application')).toHaveAttribute('disabled');
  });

  it('Configure source repository to import and check full launch until next steps', async () => {
    const mockClient = mockLauncherClient();
    const comp = render(<LauncherClientProvider client={mockClient}><ImportExistingFlow /></LauncherClientProvider>);

    // Resolve overview promises
    await flushPromises();

    await configureSrc(comp, 'https://github.com/nodeshift-starters/nodejs-rest-http');
    expect(comp.getByText('Import is configured')).toBeDefined();

    expect(comp.getByLabelText('Launch Application')).not.toHaveAttribute('disabled');
    expect(comp.getByLabelText('Download Application')).not.toHaveAttribute('disabled');

    await launchCheckPayloadAndProgress(comp, mockClient);

    expect(comp.getByLabelText('Your Application has been launched')).toBeDefined();

    expect(comp.getByLabelText('Console link').getAttribute('href')).toMatchSnapshot('Console link');
  });
});
