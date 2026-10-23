import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UtilsIf } from '@/components/utils/If';
import { UtilsFor, nFor } from '@/components/utils/For';
import { UtilsCard } from '@/components/utils/Card';
import { UtilsLoader } from '@/components/utils/Loader';
import { ErrorBoundary } from '@/components/utils/ErrorBoundary';
import { Form } from '@/components/form/Form';

describe('UtilsIf', () => {
  it('renders children only when the condition is truthy', () => {
    const { rerender } = render(<UtilsIf condition={0}>{() => <p>visível</p>}</UtilsIf>);
    expect(screen.queryByText('visível')).toBeNull();

    rerender(<UtilsIf condition="sim">{() => <p>visível</p>}</UtilsIf>);
    expect(screen.getByText('visível')).toBeInTheDocument();
  });

  it('renders the first matching case, falling back to the else case', () => {
    const cases = (a: boolean, b: boolean) => [
      { condition: a, content: () => <p>A</p> },
      { condition: b, content: () => <p>B</p> },
      { content: () => <p>senão</p> },
    ];

    const { rerender } = render(<UtilsIf cases={cases(false, true)} />);
    expect(screen.getByText('B')).toBeInTheDocument();

    rerender(<UtilsIf cases={cases(true, true)} />);
    expect(screen.getByText('A')).toBeInTheDocument();

    rerender(<UtilsIf cases={cases(false, false)} />);
    expect(screen.getByText('senão')).toBeInTheDocument();
  });

  it('renders nothing when no case matches', () => {
    const { container } = render(<UtilsIf cases={[{ condition: false, content: () => <p>x</p> }]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('UtilsFor', () => {
  it('renders each item with index', () => {
    render(
      <ul>
        <UtilsFor
          each={['a', 'b']}
          eachKey={({ item }) => item}
        >
          {({ item, index }) => <li>{`${index}:${item}`}</li>}
        </UtilsFor>
      </ul>,
    );

    expect(screen.getAllByRole('listitem').map(li => li.textContent)).toEqual(['0:a', '1:b']);
  });

  it('uses the index as default key and renders empty fallback', () => {
    const { rerender, container } = render(<UtilsFor each={[1]}>{({ item }) => <span>{item}</span>}</UtilsFor>);
    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(<UtilsFor each={[]} empty={<p>vazio</p>}>{() => null}</UtilsFor>);
    expect(screen.getByText('vazio')).toBeInTheDocument();

    rerender(<UtilsFor each={undefined as unknown as number[]}>{() => null}</UtilsFor>);
    expect(container).toBeEmptyDOMElement();
  });

  it('nFor builds a range', () => {
    expect(nFor(3)).toEqual([0, 1, 2]);
  });
});

describe('UtilsCard', () => {
  it('applies padding and border by default', () => {
    render(<UtilsCard data-testid="card" className="gap-4">conteúdo</UtilsCard>);
    const card = screen.getByTestId('card');

    expect(card.tagName).toBe('SECTION');
    expect(card).toHaveClass('p-6', 'border', 'gap-4');
  });

  it('removes padding and border when requested', () => {
    render(<UtilsCard data-testid="card" noPadding noBorder />);

    expect(screen.getByTestId('card')).not.toHaveClass('p-6');
    expect(screen.getByTestId('card')).not.toHaveClass('border');
  });
});

describe('UtilsLoader', () => {
  it('mounts on first show and keeps content mounted when hidden', () => {
    const child = vi.fn(() => <p>aba</p>);

    const { rerender, container } = render(<UtilsLoader show={false}>{child}</UtilsLoader>);
    expect(container).toBeEmptyDOMElement();

    rerender(<UtilsLoader show>{child}</UtilsLoader>);
    expect(screen.getByText('aba')).toBeVisible();

    rerender(<UtilsLoader show={false}>{child}</UtilsLoader>);
    expect(screen.getByText('aba')).not.toBeVisible();

    rerender(<UtilsLoader show>{child}</UtilsLoader>);
    expect(screen.getByText('aba')).toBeVisible();
  });
});

describe('ErrorBoundary', () => {
  function Boom(): never {
    throw new Error('boom');
  }

  it('renders children when nothing throws', () => {
    render(<ErrorBoundary><p>ok</p></ErrorBoundary>);

    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('renders the default translated fallback on error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ErrorBoundary><Boom /></ErrorBoundary>);

    expect(screen.getByText('Algo deu errado.')).toBeInTheDocument();
    expect(screen.getByText('Recarregue a página ou entre em contato com o suporte.')).toBeInTheDocument();
  });

  it('renders a custom fallback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ErrorBoundary fallback={<p>custom</p>}><Boom /></ErrorBoundary>);

    expect(screen.getByText('custom')).toBeInTheDocument();
  });
});

describe('Form', () => {
  it('prevents native submit and calls onSubmit without the event', () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit} aria-label="form">
        <button type="submit">enviar</button>
      </Form>,
    );

    fireEvent.click(screen.getByText('enviar'));

    expect(onSubmit).toHaveBeenCalledWith();
  });

  it('tolerates a missing onSubmit', () => {
    render(<Form aria-label="form"><button type="submit">enviar</button></Form>);

    expect(() => fireEvent.submit(screen.getByRole('form'))).not.toThrow();
  });
});
