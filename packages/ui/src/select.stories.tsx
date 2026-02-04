import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="">
      <option value="" disabled>
        선택
      </option>
      <option value="one">One</option>
      <option value="two">Two</option>
    </Select>
  ),
};

export const Filled: Story = {
  render: () => (
    <Select defaultValue="two">
      <option value="one">One</option>
      <option value="two">Two</option>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled defaultValue="one">
      <option value="one">One</option>
      <option value="two">Two</option>
    </Select>
  ),
};
