import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
    radius: 'lg',
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'accent', 'secondary', 'ghost', 'danger', 'none'],
    },
    size: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    radius: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Accent: Story = {
  args: { variant: 'accent' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Danger: Story = {
  args: { variant: 'danger' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Pill: Story = {
  args: { children: 'Pill Button', radius: 'full' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="accent">Accent</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="xs">XSmall</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const AllRadii: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button radius="sm">sm</Button>
      <Button radius="md">md</Button>
      <Button radius="lg">lg</Button>
      <Button radius="xl">xl</Button>
      <Button radius="full">full</Button>
    </div>
  ),
};
