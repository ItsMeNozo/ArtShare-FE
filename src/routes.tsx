import { lazy } from 'react';
import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom';

// Layouts & Wrappers
import ProtectedAuthRoute from '@/components/ProtectedItems/ProtectedAuthRoute';
import ProtectedInAppRoute from '@/components/ProtectedItems/ProtectedInAppRoute';
import GuestRoute from '@/components/routes/guest-route';
import RootLayout from '@/layouts';
import OnboardingRoute from '@/components/ProtectedItems/OnboardingRoute';
import UserSubscription from '@/features/user-profile-private/UserSubscription';
import AutoLayout from '@/layouts/subLayouts/AutoLayout';
import ProFeatureRoute from './components/ProtectedItems/ProFeatureRoute';

const AuthenLayout = lazy(() => import('@/layouts/subLayouts/AuthenLayout'));
const InAppLayout = lazy(() => import('@/layouts/subLayouts/InAppLayout'));
const Dashboard = lazy(() => import('@/features/app-dashboard/Dashboard'));
const Updates = lazy(() => import('@/features/app-dashboard/Updates'));
const EditUser = lazy(() => import('@/features/edit-user/EditUserPage'));
const OnboardingProfile = lazy(() => import('@/features/onboarding'));
const RequireOnboard = lazy(() => import('@/components/ProtectedItems/RequireOnboard'));

// Lazy imports for pages/features
const LandingPage = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/features/authentication/Login'));
const SignUp = lazy(() => import('@/features/authentication/SignUp'));
const ForgotPassword = lazy(
  () => import('@/features/authentication/ForgotPassword'),
);
const AccountActivation = lazy(
  () => import('@/features/authentication/Activation'),
);
const AuthAction = lazy(() => import('@/features/authentication/HandleCallback'));
const Explore = lazy(() => import('@/features/explore'));
const BrowseBlogs = lazy(() => import('@/features/browse-blogs/BrowseBlogs'));
const BlogDetails = lazy(() => import('@/features/blog-details/BlogDetails'));
const Search = lazy(() => import('@/features/search'));
const Post = lazy(() => import('@/features/post'));

const UploadPostPage = lazy(
  () => import('@/features/post-management/routes/UploadPostPage'),
);
const EditPostPage = lazy(
  () => import('@/features/post-management/routes/EditPostPage'),
);

const Collection = lazy(() => import('@/features/collection'));
const UserProfile = lazy(
  () => import('@/features/user-profile-private/UserProfile'),
);
const DocumentDashboard = lazy(
  () => import('@/features/user-writing/DocumentDashboard'),
);
const MyWriting = lazy(() => import('@/features/user-writing/MyWriting'));
const ArtGeneration = lazy(() => import('@/features/gen-art/ArtGenAI'));
const ImageEditor = lazy(() => import('@/features/edit-image/EditImage'));
const BrowseImage = lazy(() => import('@/features/edit-image/BrowseImage'));

const SocialLinksPage = lazy(
  () =>
    import('@/features/media-automation/social-links/routes/SocialLinksPage'),
);
const AutoSchedulingPage = lazy(
  () =>
    import('@/features/media-automation/scheduling/routes/AutoScheduling'),
);

const ProjectsPage = lazy(
  () => import('@/features/media-automation/projects/routes/ProjectsPage'),
);
const ProjectDashboardPage = lazy(
  () =>
    import('@/features/media-automation/projects/routes/ProjectDashboardPage'),
);
const ProjectEditorPage = lazy(
  () => import('@/features/media-automation/projects/routes/ProjectEditorPage'),
);

// const AutoPostsManagerPage = lazy(
//   () =>
//     import(
//       '@/features/media-automation/auto-posts/routes/AutoPostsManagerPage'
//     ),
// );

const GenerateAutoPostForm = lazy(
  () =>
    import(
      '@/features/media-automation/auto-posts/components/GenerateAutoPostForm'
    ),
);
const EditAutoPostForm = lazy(
  () =>
    import(
      '@/features/media-automation/auto-posts/components/EditAutoPostForm'
    ),
);

const NotFoundPage = lazy(() => import('@/pages/NotFound'));

const routeConfig: RouteObject[] = [
  {
    element: (
      <RootLayout>
        <Outlet />
      </RootLayout>
    ),
    children: [
      // Landing
      { index: true, element: <LandingPage /> },
      // Public Auth
      {
        element: (
          <AuthenLayout>
            <Outlet />
          </AuthenLayout>
        ),
        children: [
          {
            path: '/login',
            element: (
              <GuestRoute>
                <Login />
              </GuestRoute>
            ),
          },
          { path: '/signup', element: <SignUp /> },
          { path: '/forgot-password', element: <ForgotPassword /> },
          { path: '/auth', element: <AuthAction /> },
        ],
      },
      // Private Auth
      {
        element: (
          <ProtectedAuthRoute>
            <AuthenLayout>
              <Outlet />
            </AuthenLayout>
          </ProtectedAuthRoute>
        ),
        children: [
          { path: '/activate-account/:token', element: <AccountActivation /> },
        ],
      },
      {
        path: '/onboarding',
        element: (
          <ProtectedAuthRoute>
            <OnboardingRoute>
              <InAppLayout>
                <OnboardingProfile />
              </InAppLayout>
            </OnboardingRoute>
          </ProtectedAuthRoute>
        ),
      },
      // No layout routes (tools that need full screen) - MUST come FIRST
      {
        element: (
          <RequireOnboard>
            <ProtectedInAppRoute>
              <Outlet />
            </ProtectedInAppRoute>
          </RequireOnboard>
        ),
        children: [
          { path: '/docs/:blogId', element: <MyWriting /> },
          { path: '/image/tool/editor', element: <ImageEditor /> },
          { path: '/image/tool/text-to-image', element: <ArtGeneration /> },
          { path: '/image/tool/editor/new', element: <BrowseImage /> },
        ],
      },
      // In-App Public
      {
        element: (
          <RequireOnboard>
            <InAppLayout>
              <Outlet />
            </InAppLayout>
          </RequireOnboard>
        ),
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/dashboard/updates', element: <Updates /> },
          { path: '/explore', element: <Explore /> },
          { path: '/posts/:postId', element: <Post /> },
          { path: '/blogs', element: <BrowseBlogs /> },
          { path: '/blogs/:blogId', element: <BlogDetails /> },
          { path: '/search', element: <Search /> },
        ],
      },
      // In-App Private
      {
        element: (
          <RequireOnboard>
            <ProtectedInAppRoute>
              <InAppLayout>
                <Outlet />
              </InAppLayout>
            </ProtectedInAppRoute>
          </RequireOnboard>
        ),
        children: [
          { path: '/edit-user', element: <EditUser /> },
          { path: '/post/:postId/edit', element: <EditPostPage /> },
          { path: '/posts/new', element: <UploadPostPage /> },
          { path: '/collections', element: <Collection /> },
          { path: '/docs', element: <DocumentDashboard /> },
          { path: '/app-subscription', element: <UserSubscription /> },
          { path: '/u/:username', element: <UserProfile /> },
        ],
      },
      // Auto Private
      {
        element: (
          <RequireOnboard>
            <ProtectedInAppRoute>
              <ProFeatureRoute>
                <AutoLayout>
                  <Outlet />
                </AutoLayout>
              </ProFeatureRoute>
            </ProtectedInAppRoute>
          </RequireOnboard>
        ),
        children: [
          { path: '/auto/social-links', element: <SocialLinksPage /> },
          { path: '/auto/scheduling', element: <AutoSchedulingPage /> },
          {
            path: '/auto/projects',
            element: <Outlet />,
            children: [
              { index: true, element: <ProjectsPage /> },
              { path: 'new', element: <ProjectEditorPage /> },
              {
                path: ':projectId',
                element: <Outlet />,
                children: [
                  { path: 'details', element: <ProjectDashboardPage /> },
                  { path: 'edit', element: <ProjectEditorPage /> },
                  {
                    path: 'posts',
                    // element: <AutoPostsManagerPage />,
                    children: [
                      {
                        path: 'new',
                        element: <GenerateAutoPostForm />,
                      },
                      {
                        path: ':postId/edit',
                        element: <EditAutoPostForm />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      // No layout routes
      {
        element: (
          <RequireOnboard>
            <ProtectedInAppRoute>
              <Outlet />
            </ProtectedInAppRoute>
          </RequireOnboard>
        ),
        children: [
          { path: '/docs/:blogId', element: <MyWriting /> },
          { path: '/image/tool/editor', element: <ImageEditor /> },
          { path: '/image/tool/editor/new', element: <BrowseImage /> },
          { path: '/image/tool/text-to-image', element: <ArtGeneration /> },
        ],
      },
      // Catch-all -> redirect
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routeConfig);
