import type { Hit as AlgoliaHit } from '@algolia/client-search';
import type { ComponentProps } from 'react';
import { useHits, UseHitsProps } from 'react-instantsearch-hooks';

export type HitsProps<THit> = ComponentProps<'div'> &
  UseHitsProps & {
    hitComponent: (props: { hit: THit }) => JSX.Element;
  };

export function Hits<THit extends AlgoliaHit<Record<string, unknown>>>({
  hitComponent: Hit,
  ...props
}: HitsProps<THit>) {
  const { hits } = useHits(props);

  return (
    <>
        {hits.map((hit) => (
            <Hit key={hit.objectID} hit={hit as unknown as THit} />
        ))}
    </>
  );
}