import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';

describe('flat dark primitives', () => {
  it.each(['default', 'glow', 'outline', 'secondary', 'destructive'] as const)('%s buttons use flat surfaces', variant => {
    render(<Button variant={variant}>Action</Button>);
    expect(screen.getByRole('button').className).not.toMatch(/gradient|shadow|blur|scale/);
  });
  it.each(['steam', 'riot', 'epic', 'ea', 'linux', 'active'] as const)('%s badges keep labels without decorative effects', variant => {
    render(<Badge variant={variant}>Platform or status</Badge>);
    expect(screen.getByText('Platform or status').className).not.toMatch(/gradient|shadow|blur/);
  });
});
