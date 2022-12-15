import { Skeleton } from '@chakra-ui/react';
import * as React from 'react';

interface SkeletonLoaderProps {
    count: number;
    height: string
}

const SkeletonLoader: React.FunctionComponent<SkeletonLoaderProps> = ({ height, count}) => {
    return (
        <>
          {[...Array(count)].map((_, i) => (
            <Skeleton
              key={i}
              startColor="blackAlpha.400"
              endColor="whiteAlpha.300"
              height={height}
            width={{ base: "full" }}
              borderRadius={4}
            />
          ))}
        </>
      );
    };
    export default SkeletonLoader;