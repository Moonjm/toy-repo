import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'Type here',
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue: 'Hello world',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Disabled',
  },
};

export const Large: Story = {
  args: {
    className: 'px-4 py-3 text-base',
    placeholder: 'Large input',
  },
};
