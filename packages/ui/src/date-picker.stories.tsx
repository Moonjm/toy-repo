import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './date-picker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    value: '2024-01-15',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '2024-01-15',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: '생년월일을 선택하세요',
  },
};
