import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import { useSearchUsers } from "../../hooks/useSearchUsers";
import { UserPhoto } from "../../types";
import { transformUserToPhoto } from "../../utils/transformUserToPhoto";
import { UserPhotoRenderer } from "./UserPhotoRenderer";
import Loading from "@/components/loading/Loading";
import { InfiniteScroll } from "@/components/InfiniteScroll";

interface UserSearchResultsProps {
  searchQuery: string | null;
}

const UserSearchResults = ({ searchQuery }: UserSearchResultsProps) => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
  } = useSearchUsers({
    searchQuery: searchQuery ?? "",
    enabled: !!searchQuery,
  });

  const [photos, setPhotos] = useState<UserPhoto[]>([]);

  useEffect(() => {
    if (!data) return;

    const processNewUsers = async () => {
      const lastPage = data.pages[data.pages.length - 1];
      if (!lastPage || !lastPage.data) return;
      const photoPromises = lastPage.data.map(transformUserToPhoto);
      const newPhotos = await Promise.all(photoPromises);
      const validNewPhotos = newPhotos.filter(
        (p): p is UserPhoto => p !== null,
      );

      console.log("Fetched new photos:", validNewPhotos);
      setPhotos((prevPhotos) => [...prevPhotos, ...validNewPhotos]);
    };

    const totalUsersFetched = data.pages.flatMap((page) => page.data).length;

    if (totalUsersFetched > photos.length) {
      processNewUsers();
    }
  }, [data, photos.length]);

  useEffect(() => {
    setPhotos([]);
  }, [searchQuery]);

  return (
    <Box className="flex flex-col px-2 h-screen max-h-[68vh]">
      {isLoading && photos.length === 0 && <Loading />}

      <InfiniteScroll
        data={photos}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      >
        {" "}
        <RowsPhotoAlbum
          photos={photos}
          spacing={8}
          targetRowHeight={250}
          rowConstraints={{ singleRowMaxHeight: 256 }}
          render={{ image: UserPhotoRenderer }}
        />
      </InfiniteScroll>
    </Box>
  );
};

export default UserSearchResults;
