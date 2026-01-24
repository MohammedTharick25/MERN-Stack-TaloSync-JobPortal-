import PostJob from "./PostJob";
import DashboardLayout from "../../layouts/DashboardLayout";

const CreateJob = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Create Job</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <PostJob />
      </div>
    </DashboardLayout>
  );
};

export default CreateJob;
