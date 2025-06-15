import React, { memo, useMemo, useState } from "react";
import { Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AiFillFire } from "react-icons/ai";
import { IoHeartCircleOutline } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { TiDeleteOutline } from "react-icons/ti";

import BlogItem from "@/components/lists/BlogItem";
import { Input } from "@/components/ui/input";

import "./BrowseBlogs.css";
import { useFetchBlogs } from "./hooks/useFetchBlogs";
import { BlogTab } from "./types";
import { InfiniteScroll } from "@/components/InfiniteScroll";

const BrowseBlogs: React.FC = () => {
  const [tab, setTab] = useState<BlogTab | null>("trending");

  const [searchInput, setSearchInput] = useState("");
  const [searcQuery, setSearchQuery] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFetchBlogs({
    tab,
    searchQuery: tab ? null : searcQuery,
  });

  const allBlogs = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  console.log("allBlogs", allBlogs, data);

  const handleTabChange = (
    _: React.MouseEvent<HTMLElement>,
    val: string | null,
  ) => {
    if (!val) return;
    setTab(val as BlogTab);
  };

  return (
    <div className="flex rounded-t-3xl h-screen overflow-hidden bg-white dark:bg-mountain-950">
      <div className="flex flex-col min-h-screen flex-1">
        <div className="top-0 z-60 sticky bg-white dark:bg-mountain-900 shadow-sm p-4 border-mountain-200 dark:border-mountain-700 border-b-1">
          <div className="flex items-center space-x-4">
            <Paper className="bg-mountain-50 dark:bg-mountain-800 shadow-none rounded-full">
              <ToggleButtonGroup
                size="small"
                exclusive
                value={tab}
                onChange={handleTabChange}
                className="dark:text-white"
              >
                <ToggleButton
                  value="trending"
                  className="rounded-full dark:text-gray-300 dark:hover:bg-mountain-700"
                >
                  <AiFillFire className="mr-1 size-4 text-mountain-400 dark:text-mountain-300 capitalize" />
                  Trending
                </ToggleButton>
                <ToggleButton
                  value="following"
                  className="rounded-full dark:text-gray-300 dark:hover:bg-mountain-700"
                >
                  <IoHeartCircleOutline className="mr-1 size-4 text-mountain-400 dark:text-mountain-300" />
                  Following
                </ToggleButton>
              </ToggleButtonGroup>
            </Paper>
            <div className="relative flex flex-1 items-center">
              <FiSearch className="left-2 absolute w-5 h-5 text-gray-500 dark:text-gray-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" || !searchInput) return;
                  setSearchQuery(searchInput);
                  setTab(null);
                }}
                placeholder="Search"
                className="shadow-inner pr-8 pl-8 rounded-2xl w-full bg-white dark:bg-mountain-800 border-gray-200 dark:border-mountain-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              <TiDeleteOutline
                className={`absolute right-2 w-5 h-5 text-mountain-600 dark:text-mountain-400 cursor-pointer hover:text-mountain-700 dark:hover:text-mountain-300 ${
                  searchInput ? "block" : "hidden"
                }`}
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setTab("trending");
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 space-y-8 p-4 min-h-screen overflow-auto sidebar bg-white dark:bg-mountain-950">
          <InfiniteScroll
            data={allBlogs}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            isError={isError}
            error={error}
            hasNextPage={!!hasNextPage}
            fetchNextPage={fetchNextPage}
          >
            <div className="flex flex-col gap-4 p-4">
              {allBlogs.map((b) => (
                <BlogItem
                  key={b.id}
                  blogId={String(b.id)}
                  title={b.title}
                  // ... rest of your BlogItem props
                  content={b.content}
                  thumbnail={b.pictures?.[0] ?? "https://placehold.co/600x400"}
                  author={{
                    username: b.user.username,
                    avatar: b.user.profile_picture_url ?? "",
                  }}
                  category={b.categories?.[0]?.name ?? ""}
                  timeReading={`${Math.ceil((b.content?.split(/\s+/).length ?? 0) / 200)}m reading`}
                  dateCreated={b.created_at}
                  like_count={b.like_count}
                  comment_count={b.comment_count}
                  view_count={b.view_count}
                />
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default memo(BrowseBlogs);
