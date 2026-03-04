# File Tree: cibdhk

**Generated:** 3/3/2026, 4:15:55 PM
**Root Path:** `d:\pg\web_app\cibdhk`

```
├── 📁 backend
│   ├── 📁 .vercel
│   │   ├── 📄 README.txt
│   │   └── ⚙️ project.json
│   ├── 📁 assets
│   │   ├── 📁 fonts
│   │   │   ├── 📄 Cinzel-Bold.ttf
│   │   │   ├── 📄 GreatVibes-Regular.ttf
│   │   │   ├── 📄 Montserrat-Black.ttf
│   │   │   ├── 📄 Montserrat-BlackItalic.ttf
│   │   │   ├── 📄 Montserrat-Bold.ttf
│   │   │   ├── 📄 Montserrat-BoldItalic.ttf
│   │   │   ├── 📄 Montserrat-ExtraBold.ttf
│   │   │   ├── 📄 Montserrat-ExtraBoldItalic.ttf
│   │   │   ├── 📄 Montserrat-ExtraLight.ttf
│   │   │   ├── 📄 Montserrat-ExtraLightItalic.ttf
│   │   │   ├── 📄 Montserrat-Italic-VariableFont_wght.ttf
│   │   │   ├── 📄 Montserrat-Italic.ttf
│   │   │   ├── 📄 Montserrat-Light.ttf
│   │   │   ├── 📄 Montserrat-LightItalic.ttf
│   │   │   ├── 📄 Montserrat-Medium.ttf
│   │   │   ├── 📄 Montserrat-MediumItalic.ttf
│   │   │   ├── 📄 Montserrat-Regular.ttf
│   │   │   ├── 📄 Montserrat-SemiBold.ttf
│   │   │   ├── 📄 Montserrat-SemiBoldItalic.ttf
│   │   │   ├── 📄 Montserrat-Thin.ttf
│   │   │   ├── 📄 Montserrat-ThinItalic.ttf
│   │   │   ├── 📄 Montserrat-VariableFont_wght.ttf
│   │   │   ├── 📄 OFL.txt
│   │   │   └── 📄 README.txt
│   │   └── 📁 images
│   │       ├── 🖼️ GoldCorners.png
│   │       ├── 🖼️ SealSignature.png
│   │       ├── 🖼️ WavesBackground.png
│   │       ├── 🖼️ id-bg.png
│   │       ├── 🖼️ logo.png
│   │       └── 🖼️ logo_main.png
│   ├── 📁 controllers
│   │   ├── 📄 auth.controller.js
│   │   ├── 📄 batch.controller.js
│   │   ├── 📄 branch.controller.js
│   │   ├── 📄 certificate.controller.js
│   │   ├── 📄 class.controller.js
│   │   ├── 📄 comment.controller.js
│   │   ├── 📄 course.controller.js
│   │   ├── 📄 dashboard.controller.js
│   │   ├── 📄 employeeid.controller.js
│   │   ├── 📄 expenses.controller.js
│   │   ├── 📄 finance.controller.js
│   │   ├── 📄 inventory.controller.js
│   │   ├── 📄 mastersyllabus.controller.js
│   │   ├── 📄 requisition.controller.js
│   │   ├── 📄 role.controller.js
│   │   ├── 📄 student.controller.js
│   │   └── 📄 user.controller.js
│   ├── 📁 lib
│   │   ├── 📄 db.js
│   │   ├── 📄 env.js
│   │   ├── 📄 genToken.js
│   │   └── 📄 utils.js
│   ├── 📁 middlewares
│   │   ├── 📄 auth.js
│   │   ├── 📄 auth.middleware.js
│   │   ├── 📄 branchGuard.js
│   │   ├── 📄 multer.js
│   │   └── 📄 validate.js
│   ├── 📁 models
│   │   ├── 📄 batch.js
│   │   ├── 📄 branch.js
│   │   ├── 📄 classContent.js
│   │   ├── 📄 comment.js
│   │   ├── 📄 course.js
│   │   ├── 📄 expense.js
│   │   ├── 📄 fee.js
│   │   ├── 📄 inventory.js
│   │   ├── 📄 masterSyllabus.js
│   │   ├── 📄 payment.js
│   │   ├── 📄 requisition.js
│   │   ├── 📄 role.js
│   │   ├── 📄 stockTransaction.js
│   │   ├── 📄 student.js
│   │   └── 📄 user.js
│   ├── 📁 public
│   │   └── 📁 uploads
│   │       ├── 📁 employees
│   │       │   ├── 🖼️ photo-1772148639914-664821160.jpg
│   │       │   ├── 🖼️ photo-1772405190303-915997948.jpg
│   │       │   ├── 🖼️ photo-1772405526584-142994819.jpg
│   │       │   ├── 🖼️ photo-1772408260055-672257356.jpg
│   │       │   ├── 🖼️ photo-1772426052386-674584324.jpg
│   │       │   ├── 🖼️ photo-1772426081655-601304688.jpg
│   │       │   └── 🖼️ photo-1772468750432-198160459.jpg
│   │       └── 📁 students
│   │           ├── 🖼️ photo-1772146957737-445641866.jpg
│   │           ├── 🖼️ photo-1772148624033-664161422.jpg
│   │           ├── 🖼️ photo-1772425883909-394655231.jpg
│   │           └── 🖼️ photo-1772484625895-30130077.jpg
│   ├── 📁 routes
│   │   ├── 📄 authRoutes.js
│   │   ├── 📄 batchRoutes.js
│   │   ├── 📄 branchRoutes.js
│   │   ├── 📄 certificate.routes.js
│   │   ├── 📄 class.route.js
│   │   ├── 📄 courseRoute.js
│   │   ├── 📄 dashboard.routes.js
│   │   ├── 📄 expenseRoute.js
│   │   ├── 📄 finance.routes.js
│   │   ├── 📄 inventory.route.js
│   │   ├── 📄 masterSyllabus.routes.js
│   │   ├── 📄 requisition.route.js
│   │   ├── 📄 role.routes.js
│   │   ├── 📄 studentRoutes.js
│   │   └── 📄 userRoutes.js
│   ├── 📁 scripts
│   │   ├── 📄 createAdmin.js
│   │   ├── 📄 migrateRoles.js
│   │   └── 📄 seedData.js
│   ├── 📁 utils
│   │   └── 📄 defaultSyllabus.js
│   ├── 📁 validators
│   │   ├── 📄 batch.validator.js
│   │   ├── 📄 branch.validator.js
│   │   ├── 📄 common.js
│   │   ├── 📄 course.validator.js
│   │   ├── 📄 finance.validator.js
│   │   ├── 📄 inventory.validator.js
│   │   ├── 📄 role.validator.js
│   │   ├── 📄 student.validator.js
│   │   ├── 📄 syllabus.validator.js
│   │   └── 📄 user.validator.js
│   ├── 📁 vld
│   │   ├── 📁 controllers copy
│   │   │   ├── 📄 auth.controller.js
│   │   │   ├── 📄 batch.controller.js
│   │   │   ├── 📄 branch.controller.js
│   │   │   ├── 📄 certificate.controller.js
│   │   │   ├── 📄 comment.controller.js
│   │   │   ├── 📄 course.controller.js
│   │   │   ├── 📄 dashboard.controller.js
│   │   │   ├── 📄 employeeid.controller.js
│   │   │   ├── 📄 expenses.controller.js
│   │   │   ├── 📄 inventory.controller.js
│   │   │   ├── 📄 student.controller.js
│   │   │   └── 📄 user.controller.js
│   │   ├── 📁 rt
│   │   │   ├── 📄 authRoutes.js
│   │   │   ├── 📄 batchRoutes.js
│   │   │   ├── 📄 branchRoutes.js
│   │   │   ├── 📄 certificate.routes.js
│   │   │   ├── 📄 courseRoute.js
│   │   │   ├── 📄 dashboard.routes.js
│   │   │   ├── 📄 expenseRoute.js
│   │   │   ├── 📄 inventory.route.js
│   │   │   ├── 📄 studentRoutes.js
│   │   │   └── 📄 userRoutes.js
│   │   ├── 📄 batch.validator.js
│   │   ├── 📄 branch.validator.js
│   │   ├── 📄 course.validator.js
│   │   ├── 📄 student.validator.js
│   │   └── 📄 user.validator.js
│   ├── ⚙️ .env.sample
│   ├── ⚙️ .gitignore
│   ├── ⚙️ .htaccess
│   ├── 📝 README.md
│   ├── 📦 controllers.zip
│   ├── 📄 index.js
│   ├── ⚙️ package-lock.json
│   └── ⚙️ package.json
├── 📁 web2
│   ├── 📁 .vercel
│   │   ├── 📄 README.txt
│   │   └── ⚙️ project.json
│   ├── 📁 public
│   │   ├── 🖼️ logo.png
│   │   └── 🖼️ vite.svg
│   ├── 📁 src
│   │   ├── 📁 api
│   │   │   ├── 📄 axios.js
│   │   │   ├── 📄 batch.api.js
│   │   │   ├── 📄 branch.api.js
│   │   │   ├── 📄 class.api.js
│   │   │   ├── 📄 courses.api.js
│   │   │   ├── 📄 dashboard.api.js
│   │   │   ├── 📄 inventory.api.js
│   │   │   ├── 📄 masterSyllabus.api.js
│   │   │   ├── 📄 payment.api.js
│   │   │   ├── 📄 requisition.api.js
│   │   │   ├── 📄 role.api.js
│   │   │   ├── 📄 student.api.js
│   │   │   └── 📄 user.api.js
│   │   ├── 📁 assets
│   │   │   ├── 🖼️ id-bg.png
│   │   │   ├── 🖼️ logo.png
│   │   │   └── 🖼️ react.svg
│   │   ├── 📁 components
│   │   │   ├── 📁 Search_filter
│   │   │   │   ├── 📄 CourseFilters.jsx
│   │   │   │   ├── 📄 EmployeeFilters.jsx
│   │   │   │   └── 📄 StudentFilters.jsx
│   │   │   ├── 📁 backup
│   │   │   │   └── 📄 certificatgen.jsx
│   │   │   ├── 📁 batches
│   │   │   │   ├── 📄 AddClassModal.jsx
│   │   │   │   ├── 📄 AddSyllabusModal.jsx
│   │   │   │   ├── 📄 AttendancePanel.jsx
│   │   │   │   ├── 📄 BatchFormContainer.jsx
│   │   │   │   ├── 📄 BatchHeader.jsx
│   │   │   │   ├── 📄 BatchList.jsx
│   │   │   │   ├── 📄 BatchWorkspace.jsx
│   │   │   │   ├── 📄 ClassAttendance.jsx
│   │   │   │   ├── 📄 ClassCalendar.jsx
│   │   │   │   ├── 📄 ClassRequisitionModal.jsx
│   │   │   │   ├── 📄 ClassSidebar.jsx
│   │   │   │   ├── 📄 CurriculumBuilderModal.jsx
│   │   │   │   ├── 📄 MarkClassCompleteModal.jsx
│   │   │   │   ├── 📄 QuickScheduleModal.jsx
│   │   │   │   └── 📄 ViewSyllabusModal.jsx
│   │   │   ├── 📁 common
│   │   │   │   ├── 📄 ActionIconButton.jsx
│   │   │   │   ├── 📄 Avatar.jsx
│   │   │   │   ├── 📄 BranchDropdown.jsx
│   │   │   │   ├── 📄 BranchGatekeeper.jsx
│   │   │   │   ├── 📄 CanAccess.jsx
│   │   │   │   ├── 📄 DataErrorState.jsx
│   │   │   │   ├── 📄 DataFilters.jsx
│   │   │   │   ├── 📄 DataTable.jsx
│   │   │   │   ├── 📄 EntityForm.jsx
│   │   │   │   ├── 📄 PageHeader.jsx
│   │   │   │   ├── 📄 Pagination.jsx
│   │   │   │   ├── 📄 SearchBar.jsx
│   │   │   │   └── 📄 TableSkeleton.jsx
│   │   │   ├── 📁 costs
│   │   │   │   └── 📄 CostSummaryWidget.jsx
│   │   │   ├── 📁 dashboard
│   │   │   │   ├── 📄 AttendanceChart.jsx
│   │   │   │   ├── 📄 BatchDistributionChart.jsx
│   │   │   │   ├── 📄 CompetencyChart.jsx
│   │   │   │   ├── 📄 CourseDistributionTable.jsx
│   │   │   │   ├── 📄 DashboardStatsCards.jsx
│   │   │   │   ├── 📄 GenderChart.jsx
│   │   │   │   ├── 📄 MonthlyEnrollmentChart.jsx
│   │   │   │   ├── 📄 RecentActivities.jsx
│   │   │   │   ├── 📄 RecentComments.jsx
│   │   │   │   └── 📄 StatusDistributionChart.jsx
│   │   │   ├── 📁 fields
│   │   │   │   ├── 📄 InputGroup.jsx
│   │   │   │   └── 📄 SelectGroup.jsx
│   │   │   ├── 📁 inventory
│   │   │   │   └── 📄 AddStockModal.jsx
│   │   │   ├── 📁 modal
│   │   │   │   ├── 📄 CollectPaymentModal.jsx
│   │   │   │   ├── 📄 CommentModal.jsx
│   │   │   │   ├── 📄 EditSyllabusModal.jsx
│   │   │   │   ├── 📄 EmployeeQRCodeModal.jsx
│   │   │   │   ├── 📄 QRCodeModal.jsx
│   │   │   │   └── 📄 RoleModal.jsx
│   │   │   ├── 📁 table
│   │   │   │   ├── 📄 EmployeesTable.jsx
│   │   │   │   └── 📄 StudentsTable.jsx
│   │   │   ├── 📄 AdminLayout.jsx
│   │   │   ├── 📄 ConfirmToast.jsx
│   │   │   ├── 📄 Footer.jsx
│   │   │   ├── 📄 Header.jsx
│   │   │   ├── 📄 Loader.jsx
│   │   │   ├── 📄 LogoLoader.jsx
│   │   │   ├── 📄 ProfileLayout.jsx
│   │   │   ├── 📄 PublicLayout.jsx
│   │   │   └── 📄 SearchBar.jsx
│   │   ├── 📁 css
│   │   │   ├── 🎨 Footer.css
│   │   │   └── 🎨 Header.css
│   │   ├── 📁 hooks
│   │   │   ├── 📄 useBatches.js
│   │   │   ├── 📄 useBranches.js
│   │   │   ├── 📄 useClasses.js
│   │   │   ├── 📄 useCourses.js
│   │   │   ├── 📄 useDashboard.js
│   │   │   ├── 📄 useExpenses.js
│   │   │   ├── 📄 useFinance.js
│   │   │   ├── 📄 useInventory.js
│   │   │   ├── 📄 useMasterSyllabus.js
│   │   │   ├── 📄 useRequisitions.js
│   │   │   ├── 📄 useRoles.js
│   │   │   ├── 📄 useStudents.js
│   │   │   ├── 📄 useSyllabus.js
│   │   │   └── 📄 useUser.js
│   │   ├── 📁 pages
│   │   │   ├── 📁 batches
│   │   │   │   ├── 📄 AddBatch.jsx
│   │   │   │   ├── 📄 AttendanceBook.jsx
│   │   │   │   ├── 📄 BatchListPage.jsx
│   │   │   │   ├── 📄 ManageBatches.jsx
│   │   │   │   └── 📄 ManageBatchesTabs.jsx
│   │   │   ├── 📁 branches
│   │   │   │   ├── 📄 AllBranches.jsx
│   │   │   │   ├── 📄 BranchDetails.jsx
│   │   │   │   ├── 📄 ManageBranchForm.jsx
│   │   │   │   └── 📄 ManageBranches.jsx
│   │   │   ├── 📁 courses
│   │   │   │   ├── 📄 AddCourse.jsx
│   │   │   │   └── 📄 AllCourses.jsx
│   │   │   ├── 📁 employee-public
│   │   │   │   └── 📄 EmployeeDetails.jsx
│   │   │   ├── 📁 employees
│   │   │   │   ├── 📄 AddEmployee.jsx
│   │   │   │   ├── 📄 AllEmployees.jsx
│   │   │   │   └── 📄 UpdateEmployee.jsx
│   │   │   ├── 📁 finance
│   │   │   │   └── 📄 ManageFees.jsx
│   │   │   ├── 📁 inventory
│   │   │   │   ├── 📄 AddInventory.jsx
│   │   │   │   ├── 📄 HisabNikash.jsx
│   │   │   │   └── 📄 ManageInventory.jsx
│   │   │   ├── 📁 master-syllabus
│   │   │   │   ├── 📄 AddMasterSyllabus.jsx
│   │   │   │   └── 📄 ManageMasterSyllabus.jsx
│   │   │   ├── 📁 student-public
│   │   │   │   ├── 📄 SearchStudent.jsx
│   │   │   │   └── 📄 StudentDetails.jsx
│   │   │   ├── 📁 students
│   │   │   │   ├── 📄 AddStudent.jsx
│   │   │   │   ├── 📄 AllStudents.jsx
│   │   │   │   └── 📄 UpdateStudent.jsx
│   │   │   ├── 📁 system
│   │   │   │   └── 📄 ManageRoles.jsx
│   │   │   ├── 📄 BranchDashboard.jsx
│   │   │   ├── 📄 Dashboard.jsx
│   │   │   ├── 📄 LoginPage.jsx
│   │   │   └── 📄 ManageAdmins.jsx
│   │   ├── 📁 store
│   │   │   └── 📄 useAuth.js
│   │   ├── 📁 utils
│   │   │   └── 📄 permissions.js
│   │   ├── 🎨 App.css
│   │   ├── 📄 App.jsx
│   │   ├── 🎨 index.css
│   │   └── 📄 main.jsx
│   ├── ⚙️ .gitignore
│   ├── 📄 Constant.js
│   ├── 📝 README.md
│   ├── 📄 eslint.config.js
│   ├── 🌐 index.html
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── ⚙️ vercel.json
│   └── 📄 vite.config.js
├── ⚙️ package-lock.json
└── ⚙️ package.json
```

---
*Generated by FileTree Pro Extension*