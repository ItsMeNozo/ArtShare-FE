// import { ChangeEvent } from "react";
// import { Avatar, Box, Button, IconButton, Typography } from "@mui/material";
// import {
//     MdAdd,
//     MdClose,
// } from "react-icons/md";
// import AutoSizer from "react-virtualized-auto-sizer";
// import { RiImageCircleAiFill } from "react-icons/ri";

// const MAX_IMAGES = 4;

// interface UploadAIImagesProp {

// }

// const UploadAIImages: React.FC<UploadAIImagesProp> = (

// ) => {
//     return (
//         <AutoSizer>
//             {({ height, width }) => {
//                 const adjustedHeight = Math.max(height - 61, 150);
//                 return (
//                     <Box
//                         sx={{
//                             width,
//                             height: adjustedHeight,
//                             display: "flex",
//                             flexDirection: "column",
//                             alignItems: "center",
//                             overflow: "hidden",
//                             minHeight: 0,
//                             position: "relative"
//                         }}
//                     >
//                         <Box
//                             className="top-2 left-2 z-50 absolute flex items-center space-x-2 mb-2 w-full"
//                             sx={{ flexShrink: 0 }}
//                         >
//                             <Typography className="text-gray-900 dark:text-mountain-200 text-base">
//                                 {imageFilesPreview.size}/{MAX_IMAGES} images
//                             </Typography>
//                             <Typography className="text-gray-900 dark:text-mountain-200 text-base">
//                             </Typography>
//                         </Box>
//                         <Box
//                             sx={{
//                                 height: "100%",
//                                 minHeight: 0,
//                                 width: "100%",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 overflow: "hidden",
//                             }}
//                             className="flex flex-col justify-center items-center bg-mountain-100 border border-gray-500 border-dashed rounded-lg w-full h-full"
//                         >
//                             {selectedPreview ? (
//                                 <img
//                                     src={imageFilesPreview.get(selectedPreview)}
//                                     alt="Preview"
//                                     className="w-full object-cover aspect-video"
//                                     style={{ maxHeight: "100%", maxWidth: "100%" }}
//                                 />
//                             ) : (
//                                 <Box
//                                     className="flex flex-col justify-center items-center bg-mountain-100 border border-gray-500 border-dashed rounded-lg w-full h-full"
//                                     onDragOver={(e) => e.preventDefault()}
//                                     onDrop={(e) => {
//                                         e.preventDefault();
//                                         const droppedFiles = e.dataTransfer.files;
//                                         if (droppedFiles && droppedFiles.length > 0) {
//                                             handleImageFilesChange({
//                                                 target: { files: droppedFiles },
//                                             } as ChangeEvent<HTMLInputElement>);
//                                         }
//                                     }}
//                                 >
//                                     <div className="flex flex-col">
//                                         <Button
//                                             variant="text"
//                                             component="label"
//                                             size="small"
//                                             className="flex flex-col justify-center items-center bg-white hover:bg-mountain-50 shadow-md p-4 border-1 border-mountain-200 w-40"
//                                             sx={{
//                                                 backgroundColor: "transparent",
//                                                 color: "white",
//                                                 borderRadius: "10px",
//                                                 textTransform: "none",
//                                                 "&:hover": { backgroundColor: "transparent" },
//                                             }}
//                                         >
//                                             <input
//                                                 type="file"
//                                                 multiple
//                                                 accept="image/*"
//                                                 hidden
//                                                 onChange={handleImageFilesChange}
//                                             />
//                                             <RiImageCircleAiFill className="mb-2 size-10 text-mountain-600" />
//                                             <Typography variant="body1" className="text-sm">Browse My Stock</Typography>
//                                         </Button>
//                                         <Typography variant="body1" className="mt-2">
//                                             or drag and drop here
//                                         </Typography>
//                                     </div>
//                                 </Box>
//                             )}
//                         </Box>
//                         {/* Carousel */}
//                         <Box
//                             className="flex space-x-2 pt-3 h-fit custom-scrollbar"
//                             sx={{ flexShrink: 0, overflowX: "hidden" }}
//                         >
//                             {Array.from(imageFilesPreview.entries()).map(
//                                 ([file, previewUrl], i) => (
//                                     <Box
//                                         key={i}
//                                         className="relative border-1 rounded-md cursor-pointer bounce-item"
//                                         sx={{
//                                             borderColor:
//                                                 selectedPreview === file
//                                                     ? "primary.main"
//                                                     : "transparent",
//                                         }}
//                                         onClick={() => setSelectedPreview(file)}
//                                     >
//                                         <Avatar
//                                             src={previewUrl}
//                                             className="rounded-md"
//                                             sx={{ width: 80, height: 80 }}
//                                         />
//                                         <IconButton
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleRemoveImagePreview(file);
//                                             }}
//                                             size="small"
//                                             className="group -top-2 -right-2 absolute bg-gray-600 hover:bg-gray-400 opacity-60"
//                                         >
//                                             <MdClose
//                                                 className="text-white group-hover:text-black text-sm"
//                                                 size={16}
//                                             />
//                                         </IconButton>
//                                     </Box>
//                                 ),
//                             )}
//                             <Box
//                                 className="flex justify-center items-center border border-mountain-600 rounded-md w-[80px] h-[80px] text-gray-900 dark:text-white cursor-pointer"
//                                 component="label"
//                                 hidden={
//                                     imageFilesPreview.size === 0 ||
//                                     imageFilesPreview.size === MAX_IMAGES
//                                 }
//                             >
//                                 <MdAdd size={32} />
//                                 <input
//                                     accept="image/*"
//                                     type="file"
//                                     multiple
//                                     hidden
//                                     onChange={handleImageFilesChange}
//                                 />
//                             </Box>
//                         </Box>
//                     </Box>
//                 );
//             }}
//         </AutoSizer>
//     )
// }

// export default UploadAIImages
