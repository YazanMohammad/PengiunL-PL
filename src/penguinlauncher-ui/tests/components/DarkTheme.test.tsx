import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { Button } from '../../src/components/ui/button';
import { Badge } from '../../src/components/ui/badge';

describe('flat dark primitives', () => {
  // Characterization of the approved palette, already correct before this wave.
  it('supplies the approved opaque dark palette and dark text on sage actions', () => {
    const css = postcss.parse(readFileSync('src/index.css', 'utf8'));
    const style = document.createElement('style');
    css.walkRules(':root', rule => { style.textContent = rule.toString(); });
    document.head.append(style);
    try {
      const tokens = getComputedStyle(document.documentElement);
      for (const [token, value] of [
        ['background', '210 5.882353% 6.666667%'],
        ['card', '210 8% 9.803922%'],
        ['border', '210 6.666667% 17.647059%'],
        ['foreground', '180 3.030303% 93.529412%'],
        ['muted-foreground', '201.818182 6.358382% 66.078431%'],
        ['primary', '124 16.129032% 81.764706%'],
        ['primary-foreground', '135 12.5% 12.549020%'],
      ]) expect(tokens.getPropertyValue(`--${token}`).trim()).toBe(value);
      render(<Button>Primary action</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary', 'text-primary-foreground');
    } finally {
      style.remove();
    }
  });

  it.each(['default', 'glow', 'outline', 'secondary', 'destructive'] as const)('%s buttons use flat surfaces', variant => {
    render(<Button variant={variant}>Action</Button>);
    expect(screen.getByRole('button').className).not.toMatch(/gradient|shadow|blur|scale/);
  });
  it.each(['steam', 'riot', 'epic', 'ea', 'linux', 'active'] as const)('%s badges keep labels without decorative effects', variant => {
    render(<Badge variant={variant}>Platform or status</Badge>);
    expect(screen.getByText('Platform or status').className).not.toMatch(/gradient|shadow|blur/);
  });
});
