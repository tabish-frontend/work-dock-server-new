import { BoardModel, WorkspaceModel } from "../../models";
import { AppError, AppResponse, ResponseStatus, catchAsync } from "../../utils";

export const addWorkspace = catchAsync(async (req: any, res: any) => {
  const { name, members } = req.body;

  const owner = req.user._id;
  const slug = name.trim().toLowerCase().replace(/\s+/g, "_");

  const newWorkSpace = await WorkspaceModel.create({
    name,
    slug,
    owner,
    members,
  });

  const populatedWorkSpace = await WorkspaceModel.findById(newWorkSpace._id)
    .populate("owner", "full_name username avatar")
    .populate("members", "full_name username avatar");

  return res
    .status(201)
    .json(
      new AppResponse(
        201,
        populatedWorkSpace,
        "WorkSpace Added Successfully",
        ResponseStatus.SUCCESS
      )
    );
});

export const getAllWorkspaces = catchAsync(async (req, res) => {
  // Find workSpace within the date range and populate members and owner references

  const workspaces = await WorkspaceModel.find()
    .populate("owner", "full_name username avatar")
    .populate("members", "full_name username avatar")
    .populate({
      path: "boards",
      populate: [
        { path: "owner", select: "full_name username avatar" },
        { path: "members", select: "full_name username avatar" },
        {
          path: "columns",
          populate: {
            path: "tasks",
            select: "title description column assignedTo owner",
            populate: [
              { path: "assignedTo", select: "full_name username avatar" },
              { path: "owner", select: "full_name username avatar" },
            ],
          },
        },
      ],
    });

  if (!workspaces) {
    throw new AppError("No WorkSpace found", 409);
  }

  return res
    .status(200)
    .json(new AppResponse(200, workspaces, "", ResponseStatus.SUCCESS));
});

export const updateWorkspace = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, members } = req.body;

  const slug = name.trim().toLowerCase().replace(/\s+/g, "_");
  const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
    id,
    { name, members, slug },
    {
      new: true,
    }
  )
    .populate("owner", "full_name username avatar")
    .populate("members", "full_name username avatar")
    .populate({
      path: "boards",
      populate: [
        { path: "owner", select: "full_name username avatar" },
        { path: "members", select: "full_name username avatar" },
        {
          path: "columns",
          populate: {
            path: "tasks",
            select: "title description column assignedTo owner",
            populate: [
              { path: "assignedTo", select: "full_name username avatar" },
              { path: "owner", select: "full_name username avatar" },
            ],
          },
        },
      ],
    });

  if (!updatedWorkspace) {
    return res
      .status(404)
      .json(
        new AppResponse(404, null, "Workspace not found", ResponseStatus.ERROR)
      );
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        updatedWorkspace,
        "Workspace Updated",
        ResponseStatus.SUCCESS
      )
    );
});

export const deleteWorkSpace = catchAsync(async (req, res) => {
  const { id } = req.params;
  // Trigger the middleware by using `findOneAndDelete`
  const deletedWorkspace = await WorkspaceModel.findOneAndDelete({ _id: id });

  if (!deletedWorkspace) {
    return res
      .status(404)
      .json(
        new AppResponse(404, null, "Workspace not found", ResponseStatus.ERROR)
      );
  }

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        deletedWorkspace,
        "Workspace and all related entities deleted successfully",
        ResponseStatus.SUCCESS
      )
    );
});
