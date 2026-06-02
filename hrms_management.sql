-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 14, 2026 at 02:03 PM
-- Server version: 12.0.2-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hrms_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_reports`
--

CREATE TABLE `admin_reports` (
  `id` int(11) NOT NULL,
  `task_id` varchar(50) DEFAULT NULL,
  `task_description` text DEFAULT NULL,
  `task_assigned_by` varchar(100) DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `priority` enum('High','Medium','Low') DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `target_completion_date` date DEFAULT NULL,
  `final_status` enum('Pending','In Progress','Completed','Delayed') DEFAULT NULL,
  `actual_completion_date` date DEFAULT NULL,
  `reason_for_delay` text DEFAULT NULL,
  `submitted_to` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_reports`
--

INSERT INTO `admin_reports` (`id`, `task_id`, `task_description`, `task_assigned_by`, `assigned_to`, `priority`, `start_date`, `target_completion_date`, `final_status`, `actual_completion_date`, `reason_for_delay`, `submitted_to`, `created_at`) VALUES
(7, '101', 'Testing', 'Testing', 'Testing', 'High', '2026-02-03', '2026-02-03', 'Completed', '2026-02-03', 'Testing', 'TR', '2026-02-02 04:22:15'),
(8, '999', 'fetch data and connect to db', 'parthaaaaaa', 'sultan', 'High', '2026-02-12', '2026-02-20', 'Completed', '2026-02-28', 'just', 'parthaaaa', '2026-02-12 05:38:37'),
(19, 'TSK-001', 'Create HR Dashboard', 'Manager A', 'Rahul', 'High', '2025-02-10', '2025-02-15', 'Pending', '2025-02-15', NULL, 'Onboarding Team', '2026-02-12 06:31:44'),
(20, 'TSK-002', 'API Integration for Tasks', 'Manager B', 'Priya', 'Medium', '2025-02-12', '2025-02-18', 'In Progress', '2026-02-13', NULL, 'Tech Lead', '2026-02-12 06:31:44'),
(21, 'TSK-003', 'UI Bug Fixes', 'Manager A', 'Karthik', 'Low', '2025-02-14', '2025-02-20', 'Completed', '2026-02-13', NULL, 'QA Team', '2026-02-12 06:31:44'),
(22, 'TSK-004', 'Database Optimization', 'Manager C', 'Anitha', 'High', '2025-02-01', '2025-02-10', 'Delayed', '2025-02-14', 'Server downtime', 'DB Admin', '2026-02-12 06:31:44'),
(23, 'TSK-005', 'Excel Upload Feature', 'Manager B', 'Suresh', 'Medium', '2025-02-16', '2025-02-22', 'In Progress', '2025-02-21', NULL, 'HR Team', '2026-02-12 06:31:44');

-- --------------------------------------------------------

--
-- Table structure for table `appointed_candidates`
--

CREATE TABLE `appointed_candidates` (
  `id` int(11) NOT NULL,
  `entry_date` date DEFAULT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `candidate_name` varchar(255) NOT NULL,
  `candidate_number` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `experience` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `fixed_salary` decimal(10,2) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `hr_name` varchar(255) DEFAULT NULL,
  `document_status` varchar(50) DEFAULT 'Pending',
  `training_status` varchar(50) DEFAULT 'Training',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointed_candidates`
--

INSERT INTO `appointed_candidates` (`id`, `entry_date`, `branch`, `candidate_name`, `candidate_number`, `email`, `position`, `experience`, `brand`, `fixed_salary`, `source`, `appointment_date`, `hr_name`, `document_status`, `training_status`, `created_at`) VALUES
(9, '2026-02-12', 'chennai', 'dk', '34567io', 'killetdhanu61@gmail.com', 'developer', '2', 'it', 2060000.00, 'LinkedIn', '2026-02-28', 'jp', 'Verified', 'Confirmed', '2026-02-12 04:03:39'),
(10, '2025-02-20', 'Chennai', 'Rahul Kumar', '9876543210', 'rahul.kumar@gmail.com', 'Java Developer', '2 Years', 'ABC Corp', 35000.00, 'LinkedIn', '2025-03-01', 'Priya HR', 'Pending', 'Training', '2026-02-12 05:34:42'),
(11, '2025-02-21', 'Bangalore', 'Anitha Sharma', '9123456789', 'anitha.sharma@gmail.com', 'Frontend Developer', '1.5 Years', 'XYZ Tech', 30000.00, 'Naukri', '2025-03-05', 'Ramesh HR', 'Pending', 'Training', '2026-02-12 05:34:42'),
(12, '2025-02-22', 'Hyderabad', 'Suresh Reddy', '9988776655', 'suresh.reddy@gmail.com', 'Backend Developer', '3 Years', 'TechSoft', 45000.00, 'Referral', '2025-03-10', 'Kavya HR', 'Pending', 'Training', '2026-02-12 05:34:42'),
(13, '2025-02-23', 'Coimbatore', 'Meena Lakshmi', '9090909090', 'meena.lakshmi@gmail.com', 'HR Executive', '2 Years', 'PeopleFirst', 28000.00, 'Walk-in', '2025-03-12', 'Arun HR', 'Pending', 'Training', '2026-02-12 05:34:42');

-- --------------------------------------------------------

--
-- Table structure for table `appraisal_cycles`
--

CREATE TABLE `appraisal_cycles` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Active','Closed') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appraisal_cycles`
--

INSERT INTO `appraisal_cycles` (`id`, `title`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(1, 'Annual Review 2015', '2026-01-01', '2026-12-01', 'Active', '2026-01-03 07:24:42'),
(2, 'Annual Review 2016', '2026-01-03', '2026-01-31', 'Active', '2026-01-03 09:37:16'),
(3, 'Annual Review 2017', '2026-01-03', '2026-01-08', 'Active', '2026-01-03 13:01:26'),
(4, 'Annual Review 2018', '2026-01-01', '2026-01-31', 'Active', '2026-01-05 07:09:49'),
(5, 'Annual Review 2019', '2026-01-01', '2026-12-31', 'Active', '2026-01-07 04:31:31'),
(6, 'Annual Review 2026', '2026-01-01', '2026-12-31', 'Active', '2026-01-10 04:30:36'),
(7, 'Annual Review 2025', '2025-01-01', '2025-12-31', 'Active', '2026-01-30 09:17:34'),
(8, 'testing annual review 2026', '2026-02-01', '2026-02-13', 'Active', '2026-02-04 11:29:55'),
(9, 'l', '2026-02-13', '2026-03-05', 'Active', '2026-02-14 12:50:28');

-- --------------------------------------------------------

--
-- Table structure for table `appraisal_parameters`
--

CREATE TABLE `appraisal_parameters` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appraisal_parameters`
--

INSERT INTO `appraisal_parameters` (`id`, `category_name`, `description`) VALUES
(1, 'Job Knowledge', 'Understanding of role, skills, and technical knowledge'),
(2, 'Work Quality', 'Accuracy, thoroughness, and attention to detail'),
(3, 'Productivity', 'Volume of work, meeting deadlines, and efficiency'),
(4, 'Communication Skills', 'Verbal and written communication, listening skills'),
(5, 'Teamwork', 'Collaboration, helpfulness, and team spirit'),
(6, 'Attendance & Punctuality', 'Adherence to work hours and leave policies');

-- --------------------------------------------------------

--
-- Table structure for table `appraisal_ratings`
--

CREATE TABLE `appraisal_ratings` (
  `id` int(11) NOT NULL,
  `appraisal_id` int(11) DEFAULT NULL,
  `parameter_id` int(11) DEFAULT NULL,
  `self_rating` int(11) DEFAULT NULL CHECK (`self_rating` between 1 and 5),
  `manager_rating` int(11) DEFAULT NULL CHECK (`manager_rating` between 1 and 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appraisal_ratings`
--

INSERT INTO `appraisal_ratings` (`id`, `appraisal_id`, `parameter_id`, `self_rating`, `manager_rating`) VALUES
(1, 1, 1, 3, 4),
(2, 1, 2, 3, 4),
(3, 1, 3, 3, 4),
(4, 1, 4, 3, 4),
(5, 1, 5, 3, 4),
(6, 1, 6, 3, 4),
(7, 2, 1, NULL, NULL),
(8, 2, 2, NULL, NULL),
(9, 2, 3, NULL, NULL),
(10, 2, 4, NULL, NULL),
(11, 2, 5, NULL, NULL),
(12, 2, 6, NULL, NULL),
(13, 3, 1, NULL, NULL),
(14, 3, 2, NULL, NULL),
(15, 3, 3, NULL, NULL),
(16, 3, 4, NULL, NULL),
(17, 3, 5, NULL, NULL),
(18, 3, 6, NULL, NULL),
(19, 4, 1, NULL, NULL),
(20, 4, 2, NULL, NULL),
(21, 4, 3, NULL, NULL),
(22, 4, 4, NULL, NULL),
(23, 4, 5, NULL, NULL),
(24, 4, 6, NULL, NULL),
(25, 5, 1, 5, 5),
(26, 5, 2, 5, 5),
(27, 5, 3, 5, 3),
(28, 5, 4, 5, 4),
(29, 5, 5, 5, 3),
(30, 5, 6, 5, 4),
(31, 6, 1, NULL, NULL),
(32, 6, 2, NULL, NULL),
(33, 6, 3, NULL, NULL),
(34, 6, 4, NULL, NULL),
(35, 6, 5, NULL, NULL),
(36, 6, 6, NULL, NULL),
(37, 7, 1, NULL, NULL),
(38, 7, 2, NULL, NULL),
(39, 7, 3, NULL, NULL),
(40, 7, 4, NULL, NULL),
(41, 7, 5, NULL, NULL),
(42, 7, 6, NULL, NULL),
(43, 8, 1, NULL, NULL),
(44, 8, 2, NULL, NULL),
(45, 8, 3, NULL, NULL),
(46, 8, 4, NULL, NULL),
(47, 8, 5, NULL, NULL),
(48, 8, 6, NULL, NULL),
(49, 9, 1, 4, 5),
(50, 9, 2, 4, 5),
(51, 9, 3, 4, 5),
(52, 9, 4, 4, 5),
(53, 9, 5, 4, 5),
(54, 9, 6, 4, 5),
(55, 10, 1, NULL, NULL),
(56, 10, 2, NULL, NULL),
(57, 10, 3, NULL, NULL),
(58, 10, 4, NULL, NULL),
(59, 10, 5, NULL, NULL),
(60, 10, 6, NULL, NULL),
(61, 11, 1, NULL, NULL),
(62, 11, 2, NULL, NULL),
(63, 11, 3, NULL, NULL),
(64, 11, 4, NULL, NULL),
(65, 11, 5, NULL, NULL),
(66, 11, 6, NULL, NULL),
(67, 12, 1, NULL, NULL),
(68, 12, 2, NULL, NULL),
(69, 12, 3, NULL, NULL),
(70, 12, 4, NULL, NULL),
(71, 12, 5, NULL, NULL),
(72, 12, 6, NULL, NULL),
(73, 13, 1, 3, 3),
(74, 13, 2, 2, 2),
(75, 13, 3, 2, 5),
(76, 13, 4, 4, 5),
(77, 13, 5, 3, 5),
(78, 13, 6, 5, 5),
(79, 14, 1, NULL, NULL),
(80, 14, 2, NULL, NULL),
(81, 14, 3, NULL, NULL),
(82, 14, 4, NULL, NULL),
(83, 14, 5, NULL, NULL),
(84, 14, 6, NULL, NULL),
(85, 15, 1, NULL, NULL),
(86, 15, 2, NULL, NULL),
(87, 15, 3, NULL, NULL),
(88, 15, 4, NULL, NULL),
(89, 15, 5, NULL, NULL),
(90, 15, 6, NULL, NULL),
(91, 16, 1, NULL, NULL),
(92, 16, 2, NULL, NULL),
(93, 16, 3, NULL, NULL),
(94, 16, 4, NULL, NULL),
(95, 16, 5, NULL, NULL),
(96, 16, 6, NULL, NULL),
(97, 17, 1, NULL, NULL),
(98, 17, 2, NULL, NULL),
(99, 17, 3, NULL, NULL),
(100, 17, 4, NULL, NULL),
(101, 17, 5, NULL, NULL),
(102, 17, 6, NULL, NULL),
(103, 18, 1, NULL, NULL),
(104, 18, 2, NULL, NULL),
(105, 18, 3, NULL, NULL),
(106, 18, 4, NULL, NULL),
(107, 18, 5, NULL, NULL),
(108, 18, 6, NULL, NULL),
(109, 19, 1, NULL, NULL),
(110, 19, 2, NULL, NULL),
(111, 19, 3, NULL, NULL),
(112, 19, 4, NULL, NULL),
(113, 19, 5, NULL, NULL),
(114, 19, 6, NULL, NULL),
(115, 20, 1, NULL, NULL),
(116, 20, 2, NULL, NULL),
(117, 20, 3, NULL, NULL),
(118, 20, 4, NULL, NULL),
(119, 20, 5, NULL, NULL),
(120, 20, 6, NULL, NULL),
(121, 21, 1, NULL, NULL),
(122, 21, 2, NULL, NULL),
(123, 21, 3, NULL, NULL),
(124, 21, 4, NULL, NULL),
(125, 21, 5, NULL, NULL),
(126, 21, 6, NULL, NULL),
(127, 22, 1, NULL, NULL),
(128, 22, 2, NULL, NULL),
(129, 22, 3, NULL, NULL),
(130, 22, 4, NULL, NULL),
(131, 22, 5, NULL, NULL),
(132, 22, 6, NULL, NULL),
(133, 23, 1, NULL, NULL),
(134, 23, 2, NULL, NULL),
(135, 23, 3, NULL, NULL),
(136, 23, 4, NULL, NULL),
(137, 23, 5, NULL, NULL),
(138, 23, 6, NULL, NULL),
(139, 24, 1, NULL, NULL),
(140, 24, 2, NULL, NULL),
(141, 24, 3, NULL, NULL),
(142, 24, 4, NULL, NULL),
(143, 24, 5, NULL, NULL),
(144, 24, 6, NULL, NULL),
(145, 25, 1, NULL, NULL),
(146, 25, 2, NULL, NULL),
(147, 25, 3, NULL, NULL),
(148, 25, 4, NULL, NULL),
(149, 25, 5, NULL, NULL),
(150, 25, 6, NULL, NULL),
(151, 26, 1, NULL, NULL),
(152, 26, 2, NULL, NULL),
(153, 26, 3, NULL, NULL),
(154, 26, 4, NULL, NULL),
(155, 26, 5, NULL, NULL),
(156, 26, 6, NULL, NULL),
(157, 27, 1, NULL, NULL),
(158, 27, 2, NULL, NULL),
(159, 27, 3, NULL, NULL),
(160, 27, 4, NULL, NULL),
(161, 27, 5, NULL, NULL),
(162, 27, 6, NULL, NULL),
(163, 28, 1, NULL, NULL),
(164, 28, 2, NULL, NULL),
(165, 28, 3, NULL, NULL),
(166, 28, 4, NULL, NULL),
(167, 28, 5, NULL, NULL),
(168, 28, 6, NULL, NULL),
(169, 29, 1, NULL, NULL),
(170, 29, 2, NULL, NULL),
(171, 29, 3, NULL, NULL),
(172, 29, 4, NULL, NULL),
(173, 29, 5, NULL, NULL),
(174, 29, 6, NULL, NULL),
(175, 30, 1, NULL, NULL),
(176, 30, 2, NULL, NULL),
(177, 30, 3, NULL, NULL),
(178, 30, 4, NULL, NULL),
(179, 30, 5, NULL, NULL),
(180, 30, 6, NULL, NULL),
(181, 31, 1, 5, 5),
(182, 31, 2, 5, 5),
(183, 31, 3, 5, 5),
(184, 31, 4, 5, 5),
(185, 31, 5, 5, 5),
(186, 31, 6, 5, 5),
(187, 32, 1, NULL, NULL),
(188, 32, 2, NULL, NULL),
(189, 32, 3, NULL, NULL),
(190, 32, 4, NULL, NULL),
(191, 32, 5, NULL, NULL),
(192, 32, 6, NULL, NULL),
(193, 33, 1, NULL, NULL),
(194, 33, 2, NULL, NULL),
(195, 33, 3, NULL, NULL),
(196, 33, 4, NULL, NULL),
(197, 33, 5, NULL, NULL),
(198, 33, 6, NULL, NULL),
(199, 34, 1, NULL, NULL),
(200, 34, 2, NULL, NULL),
(201, 34, 3, NULL, NULL),
(202, 34, 4, NULL, NULL),
(203, 34, 5, NULL, NULL),
(204, 34, 6, NULL, NULL),
(205, 35, 1, NULL, NULL),
(206, 35, 2, NULL, NULL),
(207, 35, 3, NULL, NULL),
(208, 35, 4, NULL, NULL),
(209, 35, 5, NULL, NULL),
(210, 35, 6, NULL, NULL),
(211, 36, 1, NULL, NULL),
(212, 36, 2, NULL, NULL),
(213, 36, 3, NULL, NULL),
(214, 36, 4, NULL, NULL),
(215, 36, 5, NULL, NULL),
(216, 36, 6, NULL, NULL),
(217, 37, 1, NULL, NULL),
(218, 37, 2, NULL, NULL),
(219, 37, 3, NULL, NULL),
(220, 37, 4, NULL, NULL),
(221, 37, 5, NULL, NULL),
(222, 37, 6, NULL, NULL),
(223, 38, 1, NULL, NULL),
(224, 38, 2, NULL, NULL),
(225, 38, 3, NULL, NULL),
(226, 38, 4, NULL, NULL),
(227, 38, 5, NULL, NULL),
(228, 38, 6, NULL, NULL),
(229, 39, 1, NULL, NULL),
(230, 39, 2, NULL, NULL),
(231, 39, 3, NULL, NULL),
(232, 39, 4, NULL, NULL),
(233, 39, 5, NULL, NULL),
(234, 39, 6, NULL, NULL),
(235, 40, 1, NULL, NULL),
(236, 40, 2, NULL, NULL),
(237, 40, 3, NULL, NULL),
(238, 40, 4, NULL, NULL),
(239, 40, 5, NULL, NULL),
(240, 40, 6, NULL, NULL),
(241, 41, 1, NULL, NULL),
(242, 41, 2, NULL, NULL),
(243, 41, 3, NULL, NULL),
(244, 41, 4, NULL, NULL),
(245, 41, 5, NULL, NULL),
(246, 41, 6, NULL, NULL),
(247, 42, 1, NULL, NULL),
(248, 42, 2, NULL, NULL),
(249, 42, 3, NULL, NULL),
(250, 42, 4, NULL, NULL),
(251, 42, 5, NULL, NULL),
(252, 42, 6, NULL, NULL),
(253, 43, 1, NULL, NULL),
(254, 43, 2, NULL, NULL),
(255, 43, 3, NULL, NULL),
(256, 43, 4, NULL, NULL),
(257, 43, 5, NULL, NULL),
(258, 43, 6, NULL, NULL),
(259, 44, 1, NULL, NULL),
(260, 44, 2, NULL, NULL),
(261, 44, 3, NULL, NULL),
(262, 44, 4, NULL, NULL),
(263, 44, 5, NULL, NULL),
(264, 44, 6, NULL, NULL),
(265, 45, 1, NULL, NULL),
(266, 45, 2, NULL, NULL),
(267, 45, 3, NULL, NULL),
(268, 45, 4, NULL, NULL),
(269, 45, 5, NULL, NULL),
(270, 45, 6, NULL, NULL),
(271, 46, 1, NULL, NULL),
(272, 46, 2, NULL, NULL),
(273, 46, 3, NULL, NULL),
(274, 46, 4, NULL, NULL),
(275, 46, 5, NULL, NULL),
(276, 46, 6, NULL, NULL),
(277, 47, 1, NULL, NULL),
(278, 47, 2, NULL, NULL),
(279, 47, 3, NULL, NULL),
(280, 47, 4, NULL, NULL),
(281, 47, 5, NULL, NULL),
(282, 47, 6, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('Present','Absent','Leave') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `clock_in` time DEFAULT NULL,
  `clock_out` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `employee_id`, `attendance_date`, `status`, `created_at`, `clock_in`, `clock_out`) VALUES
(36, '200', '2026-02-10', 'Present', '2026-02-10 09:36:18', '15:07:00', '21:12:00'),
(37, 'EMP006', '2026-02-12', 'Absent', '2026-02-12 08:53:41', '07:25:00', '16:25:00'),
(39, 'EMP006', '2026-02-14', 'Present', '2026-02-14 11:51:09', '11:21:00', '22:21:00');

-- --------------------------------------------------------

--
-- Table structure for table `candidates`
--

CREATE TABLE `candidates` (
  `id` int(11) NOT NULL,
  `interview_date` date DEFAULT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `candidate_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `candidate_number` varchar(50) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `experience` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `hr_name` varchar(100) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `resume_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `department_name` varchar(255) NOT NULL,
  `department_head` varchar(255) DEFAULT NULL,
  `total_employees` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `company` varchar(50) DEFAULT NULL,
  `caller_name` varchar(255) DEFAULT NULL,
  `date_of_joining` date NOT NULL,
  `dob` date NOT NULL,
  `contact_number` varchar(20) NOT NULL,
  `alternate_phone_number` varchar(20) DEFAULT NULL,
  `official_phone_number` varchar(20) DEFAULT NULL,
  `personal_mail_id` varchar(255) NOT NULL,
  `official_mail_id` varchar(255) DEFAULT NULL,
  `permanent_address` text NOT NULL,
  `temporary_address` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `email`, `employee_name`, `company`, `caller_name`, `date_of_joining`, `dob`, `contact_number`, `alternate_phone_number`, `official_phone_number`, `personal_mail_id`, `official_mail_id`, `permanent_address`, `temporary_address`) VALUES
('001', 'dharshana@gmail.com', 'dharshanaa@gmail.com', NULL, '', '2011-11-23', '1111-11-11', '9876543211', '9876543211', '9876543211', '9876543211', 'dharshu@gmail.com', 'dharshu@gmail.com', 'dharshu@gmail.com'),
('200', 'yuvanesh@gmail.com', 'Yuvanesh', NULL, '', '2025-11-13', '2025-11-13', '9876543211', '', '', 'yuvanesh@gmail.com', '', 'yuvanesh@gmail.com', 'yuvanesh@gmail.com'),
('234', 'sara@gmail.com', 'Sarathy', 'KGPL', 'NA', '2025-12-31', '2025-12-29', '9876543211', '87654322222', '9876543211', 'sara@gmail.com', 'sara@gmail.com', 'sara@gmail.com', 'sara@gmail.com'),
('900', 'sar@gmail.com', 'Parthasarathy', NULL, '', '2025-11-01', '2003-08-02', '9876543211', '', '', 'sar@gmail.com', '', 'sar@gmail.com', 'sar@gmail.com'),
('EMP001', 'john.doe@example.com', 'John Doe', 'Kalsun', NULL, '2023-01-15', '0000-00-00', '', NULL, NULL, '', NULL, '', ''),
('EMP002', 'jane.smith@example.com', 'Jane Smith', 'Kalsun', NULL, '2023-03-20', '0000-00-00', '', NULL, NULL, '', NULL, '', ''),
('EMP003', 'robert.b@example.com', 'Robert Brown', 'Kalsun', NULL, '2024-06-10', '0000-00-00', '', NULL, NULL, '', NULL, '', ''),
('EMP004', 'john.doe@gmail.com', 'John Doe', 'ABC Pvt Ltd', 'Rahul Sharma', '2022-06-14', '1995-04-09', '9876543210', '9123456780', '08045678901', 'john.personal@gmail.com', 'john.doe@abcpvtltd.com', '12 MG Road, Bangalore', '45 Residency Road, Bangalore'),
('EMP005', 'priya.sharma@gmail.com', 'Priya Sharma', 'ABC Pvt Ltd', 'Amit Verma', '2021-08-31', '1993-11-21', '9988776655', '9090909090', '08098765432', 'priya.personal@gmail.com', 'priya.sharma@abcpvtltd.com', '78 Park Street, Mumbai', '78 Park Street, Mumbai'),
('EMP006', 'arun.kumar@gmail.com', 'Arun Kumar', 'ABC Pvt Ltd', 'Sneha Reddy', '2023-01-19', '1998-07-04', '9012345678', '9345678901', '08012345678', 'arun.personal@gmail.com', 'arun.kumar@abcpvtltd.com', '23 Anna Nagar, Chennai', '10 T Nagar, Chennai');

-- --------------------------------------------------------

--
-- Table structure for table `employee_appraisals`
--

CREATE TABLE `employee_appraisals` (
  `id` int(11) NOT NULL,
  `cycle_id` int(11) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `status` enum('Pending','Self Evaluation','Manager Review','HR Review','Completed') DEFAULT 'Pending',
  `final_score` decimal(5,2) DEFAULT NULL,
  `hr_remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_appraisals`
--

INSERT INTO `employee_appraisals` (`id`, `cycle_id`, `employee_id`, `status`, `final_score`, `hr_remarks`) VALUES
(1, 1, '001', 'Completed', 4.00, 'Need to improve the performance'),
(2, 1, '900', 'Self Evaluation', NULL, NULL),
(3, 1, '234', 'Self Evaluation', NULL, NULL),
(4, 1, '200', 'Self Evaluation', NULL, NULL),
(5, 2, '001', 'Completed', 4.00, 'Need to improve the performance.'),
(6, 2, '900', 'Self Evaluation', NULL, NULL),
(7, 2, '234', 'Self Evaluation', NULL, NULL),
(8, 2, '200', 'Self Evaluation', NULL, NULL),
(9, 4, '001', 'Completed', 5.00, 'Need to improve the performance'),
(10, 4, '900', 'Self Evaluation', NULL, NULL),
(11, 4, '234', 'Self Evaluation', NULL, NULL),
(12, 4, '200', 'Self Evaluation', NULL, NULL),
(13, 6, '001', 'Completed', 4.17, 'Good'),
(14, 6, '900', 'Self Evaluation', NULL, NULL),
(15, 6, '234', 'Self Evaluation', NULL, NULL),
(16, 6, '200', 'Self Evaluation', NULL, NULL),
(17, 5, '001', 'Self Evaluation', NULL, NULL),
(18, 5, 'EMP002', 'Self Evaluation', NULL, NULL),
(19, 5, 'EMP001', 'Self Evaluation', NULL, NULL),
(20, 5, 'EMP003', 'Self Evaluation', NULL, NULL),
(21, 5, '900', 'Self Evaluation', NULL, NULL),
(22, 5, '234', 'Self Evaluation', NULL, NULL),
(23, 5, '200', 'Self Evaluation', NULL, NULL),
(24, 7, '001', 'Self Evaluation', NULL, NULL),
(25, 7, 'EMP002', 'Self Evaluation', NULL, NULL),
(26, 7, 'EMP001', 'Self Evaluation', NULL, NULL),
(27, 7, 'EMP003', 'Self Evaluation', NULL, NULL),
(28, 7, '900', 'Self Evaluation', NULL, NULL),
(29, 7, '234', 'Self Evaluation', NULL, NULL),
(30, 7, '200', 'Self Evaluation', NULL, NULL),
(31, 8, '001', 'Completed', 5.00, 'Worth for the appraisal'),
(32, 8, 'EMP002', 'Self Evaluation', NULL, NULL),
(33, 8, 'EMP001', 'Self Evaluation', NULL, NULL),
(34, 8, 'EMP003', 'Self Evaluation', NULL, NULL),
(35, 8, '900', 'Self Evaluation', NULL, NULL),
(36, 8, '234', 'Self Evaluation', NULL, NULL),
(37, 8, '200', 'Self Evaluation', NULL, NULL),
(38, 9, 'EMP006', 'Self Evaluation', NULL, NULL),
(39, 9, '001', 'Self Evaluation', NULL, NULL),
(40, 9, 'EMP002', 'Self Evaluation', NULL, NULL),
(41, 9, 'EMP001', 'Self Evaluation', NULL, NULL),
(42, 9, 'EMP004', 'Self Evaluation', NULL, NULL),
(43, 9, 'EMP005', 'Self Evaluation', NULL, NULL),
(44, 9, 'EMP003', 'Self Evaluation', NULL, NULL),
(45, 9, '900', 'Self Evaluation', NULL, NULL),
(46, 9, '234', 'Self Evaluation', NULL, NULL),
(47, 9, '200', 'Self Evaluation', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_employment`
--

CREATE TABLE `employee_employment` (
  `employee_id` varchar(50) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `employment_type` varchar(100) DEFAULT NULL,
  `designation` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `epf_no` varchar(50) DEFAULT NULL,
  `esic_no` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_employment`
--

INSERT INTO `employee_employment` (`employee_id`, `branch`, `employment_type`, `designation`, `department`, `epf_no`, `esic_no`) VALUES
('EMP004', 'Bangalore', 'Full-Time', 'Software Engineer', 'IT', 'EPF123456', 'ESIC789456'),
('EMP005', 'Mumbai', 'Full-Time', 'HR Executive', 'HR', 'EPF654321', 'ESIC456123'),
('EMP006', 'Chennai', 'Contract', 'Support Engineer', 'Operations', 'EPF789123', 'ESIC321654');

-- --------------------------------------------------------

--
-- Table structure for table `employee_financial`
--

CREATE TABLE `employee_financial` (
  `employee_id` varchar(50) NOT NULL,
  `bank_name_branch` varchar(255) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `ifsc_number` varchar(50) NOT NULL,
  `net_take_home_salary` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_financial`
--

INSERT INTO `employee_financial` (`employee_id`, `bank_name_branch`, `account_number`, `ifsc_number`, `net_take_home_salary`) VALUES
('EMP004', 'ICICI Bank Andheri', '234567890123', 'ICIC0005677', 40000.00),
('EMP005', 'ICICI Bank Andheri', '234567890123', 'ICIC0005678', 48000.00),
('EMP006', 'ICICI Bank Andheri', '234567890123', 'ICIC0005679', 400000.00);

-- --------------------------------------------------------

--
-- Table structure for table `employee_monthly_reviews`
--

CREATE TABLE `employee_monthly_reviews` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(100) DEFAULT NULL,
  `evaluation_month` varchar(7) NOT NULL,
  `avg_in_time` varchar(10) DEFAULT NULL,
  `avg_out_time` varchar(10) DEFAULT NULL,
  `permissions_taken` int(11) DEFAULT 0,
  `leaves_taken` int(11) DEFAULT 0,
  `uniform_worn` tinyint(1) DEFAULT 1,
  `work_completion` int(11) DEFAULT 0,
  `creativity_score` int(11) DEFAULT 0,
  `comments` text DEFAULT NULL,
  `document_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_performance`
--

CREATE TABLE `employee_performance` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_personal_details`
--

CREATE TABLE `employee_personal_details` (
  `employee_id` varchar(50) NOT NULL,
  `marital_status` varchar(50) NOT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `emergency_contact_person_name` varchar(255) NOT NULL,
  `emergency_contact_relationship` varchar(100) NOT NULL,
  `emergency_contact_phone_number` varchar(20) NOT NULL,
  `nominee_name` varchar(255) NOT NULL,
  `nominee_dob` date NOT NULL,
  `nominee_relationship` varchar(100) NOT NULL,
  `father_name` varchar(255) NOT NULL,
  `father_dob` date NOT NULL,
  `father_phone_number` varchar(20) NOT NULL,
  `mother_name` varchar(255) NOT NULL,
  `mother_dob` date NOT NULL,
  `mother_phone_number` varchar(20) NOT NULL,
  `spouse_name` varchar(255) DEFAULT NULL,
  `spouse_dob` date DEFAULT NULL,
  `spouse_phone_number` varchar(20) DEFAULT NULL,
  `child1_name` varchar(255) DEFAULT NULL,
  `child1_dob` date DEFAULT NULL,
  `child2_name` varchar(255) DEFAULT NULL,
  `child2_dob` date DEFAULT NULL,
  `upload_documents` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_personal_details`
--

INSERT INTO `employee_personal_details` (`employee_id`, `marital_status`, `blood_group`, `emergency_contact_person_name`, `emergency_contact_relationship`, `emergency_contact_phone_number`, `nominee_name`, `nominee_dob`, `nominee_relationship`, `father_name`, `father_dob`, `father_phone_number`, `mother_name`, `mother_dob`, `mother_phone_number`, `spouse_name`, `spouse_dob`, `spouse_phone_number`, `child1_name`, `child1_dob`, `child2_name`, `child2_dob`, `upload_documents`) VALUES
('EMP004', 'Single', 'O+', 'Peter Doe', 'Father', '9988776655', 'Mary Doe', '1970-03-11', 'Mother', 'Robert Doe', '1965-02-14', '9876501234', 'Linda Doe', '1968-08-19', '9876505678', 'Raj ', '1970-03-11', '98765432855', 'Raj ', '1970-03-11', 'Raj ', '1970-03-11', NULL),
('EMP005', 'Married', 'A+', 'Raj Sharma', 'Husband', '9876543211', 'Anil Sharma', '1988-05-04', 'Husband', 'Suresh Sharma', '1960-10-09', '9876512345', 'Kamla Sharma', '1965-12-11', '9876598765', 'Raj Sharma', '1988-05-04', '9876543209', 'Raj Sharma', '1988-05-04', 'Raj Sharma', '1988-05-04', NULL),
('EMP006', 'Single', 'B+', 'Ramesh Kumar', 'Father', '9000000001', 'Sunita Kumar', '1972-09-14', 'Mother', 'Mohan Kumar', '1968-06-19', '9000000002', 'Geeta Kumar', '1970-04-24', '9000000003', 'sharma', '1972-09-14', '9876543210', 'sharma', '1972-09-14', 'sharma', '1972-09-14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `expense_date` date NOT NULL,
  `expense_type` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `client_name`, `expense_date`, `expense_type`, `status`, `amount`, `created_at`) VALUES
(17, 'partha', '2026-02-10', 'Office Supplies', 'Paid', 200.00, '2026-02-10 11:32:07'),
(34, 'ABC Corp', '2025-02-10', 'Travel', 'Approved', 2500.00, '2026-02-11 11:54:10'),
(35, 'XYZ Pvt Ltd', '2025-02-11', 'Food', 'Pending', 1200.00, '2026-02-11 11:54:10'),
(36, 'Delta Tech', '2025-02-12', 'Accommodation', 'Approved', 5400.00, '2026-02-11 11:54:10'),
(37, 'Infosys', '2025-02-13', 'Transport', 'Rejected', 800.00, '2026-02-11 11:54:10'),
(38, 'TCS', '2025-02-14', 'Office Supplies', 'Approved', 3200.00, '2026-02-11 11:54:10');

-- --------------------------------------------------------

--
-- Table structure for table `hr_daily_task_reports`
--

CREATE TABLE `hr_daily_task_reports` (
  `id` int(11) NOT NULL,
  `task_date` date DEFAULT NULL,
  `task_no` varchar(50) DEFAULT NULL,
  `task_description` text DEFAULT NULL,
  `division` varchar(100) DEFAULT NULL,
  `task_allocated_to` varchar(100) DEFAULT NULL,
  `task_status` varchar(50) DEFAULT NULL,
  `rec_date` date DEFAULT NULL,
  `rec_task_no` varchar(50) DEFAULT NULL,
  `rec_description` text DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `nos_required` int(11) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `rec_allocated_to` varchar(100) DEFAULT NULL,
  `rec_status` varchar(50) DEFAULT NULL,
  `estimated_days` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hr_daily_task_reports`
--

INSERT INTO `hr_daily_task_reports` (`id`, `task_date`, `task_no`, `task_description`, `division`, `task_allocated_to`, `task_status`, `rec_date`, `rec_task_no`, `rec_description`, `department`, `nos_required`, `gender`, `rec_allocated_to`, `rec_status`, `estimated_days`, `created_at`) VALUES
(8, '2025-02-20', 'TASK-001', 'Prepare monthly report', 'Finance', 'Ramesh', 'Pending', '2025-02-22', 'REC-001', 'Recruit accountant', 'HR', 2, 'Male', 'Anita', 'Pending', 7, '2026-02-12 11:31:14');

-- --------------------------------------------------------

--
-- Table structure for table `hr_weekly_schedule`
--

CREATE TABLE `hr_weekly_schedule` (
  `id` int(11) NOT NULL,
  `time_slot` varchar(100) NOT NULL,
  `monday` text DEFAULT NULL,
  `tuesday` text DEFAULT NULL,
  `wednesday` text DEFAULT NULL,
  `thursday` text DEFAULT NULL,
  `friday` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `other_portals`
--

CREATE TABLE `other_portals` (
  `id` int(11) NOT NULL,
  `record_date` date DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `experience` varchar(100) DEFAULT NULL,
  `mobile_number` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `other_portals`
--

INSERT INTO `other_portals` (`id`, `record_date`, `name`, `role`, `experience`, `mobile_number`, `location`, `created_at`) VALUES
(6, '2026-02-10', '', '', '', '', '', '2026-02-10 12:44:36'),
(7, '2026-02-10', '', '', '', '', '', '2026-02-10 12:45:47'),
(8, '2025-10-09', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-10 12:54:58'),
(9, '2026-02-11', 'john', 'Web developer', '1', '8767687678', 'chennai', '2026-02-11 04:04:48'),
(10, '2025-10-09', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:05:38'),
(11, '2025-10-24', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:07:18'),
(12, '2025-10-27', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:08:44'),
(13, '2025-10-27', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:11:35'),
(14, '2025-10-27', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:13:03'),
(15, '2025-10-27', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:17:54'),
(16, '2025-10-27', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:24:18'),
(17, '2025-10-27', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:33:07'),
(18, '2025-10-27', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:33:07'),
(19, '2025-10-29', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:33:39'),
(20, '2025-10-29', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:35:59'),
(21, '2025-10-29', 'developer', 'IT', '2', '9876545678', 'chennai', '2026-02-11 04:40:10'),
(22, '2025-10-29', 'developer', 'ITT', '2', '9876545678', 'chennai', '2026-02-11 04:40:54'),
(23, '2025-10-30', 'developer', 'ITT', '2', '9876545678', 'chennai', '2026-02-11 04:42:54'),
(24, '2025-12-31', 'developer', 'ITT', '2', '9876545678', 'chennai', '2026-02-11 04:44:03');

-- --------------------------------------------------------

--
-- Table structure for table `payment_bills`
--

CREATE TABLE `payment_bills` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('Paid','Pending','Overdue') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_bills`
--

INSERT INTO `payment_bills` (`id`, `title`, `vendor`, `amount`, `due_date`, `status`, `created_at`) VALUES
(1, 'Current Bill', 'KIPL', 20000.00, '2026-02-12', 'Pending', '2026-02-02 05:29:37'),
(2, 'Internet Bill', 'KIPL', 16000.00, '2026-02-11', 'Pending', '2026-02-02 09:58:26'),
(3, 'Office Rent', 'Jayalakshmi Properties', 25000.00, '2026-02-13', 'Pending', '2026-02-12 08:45:29'),
(4, 'Internet Bill', 'ACT Fibernet', 1800.00, '2026-02-13', 'Pending', '2026-02-12 08:45:29'),
(5, 'Electricity Bill', 'TNEB', 4200.00, '2026-02-13', 'Pending', '2026-02-12 08:45:29'),
(6, 'Software Subscription', 'Zoho Corp', 3500.00, '2026-02-13', 'Pending', '2026-02-12 08:45:29'),
(7, 'Stationery Supplies', 'Local Vendor', 1200.00, '2026-02-13', 'Pending', '2026-02-12 08:45:29'),
(8, 'gg', 'g', 15.00, '2026-02-13', 'Paid', '2026-02-14 11:18:34');

-- --------------------------------------------------------

--
-- Table structure for table `payslips`
--

CREATE TABLE `payslips` (
  `id` int(11) NOT NULL,
  `salary_month` varchar(50) DEFAULT NULL,
  `salary_year` int(11) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `employee_code` varchar(50) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `pan_number` varchar(50) DEFAULT NULL,
  `uan_no` varchar(50) DEFAULT NULL,
  `esi_no` varchar(50) DEFAULT NULL,
  `total_days` int(11) DEFAULT NULL,
  `worked_days` int(11) DEFAULT NULL,
  `lop_days` int(11) DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT NULL,
  `da` decimal(10,2) DEFAULT NULL,
  `hra` decimal(10,2) DEFAULT NULL,
  `ca` decimal(10,2) DEFAULT NULL,
  `pf` decimal(10,2) DEFAULT NULL,
  `esic` decimal(10,2) DEFAULT NULL,
  `advance` decimal(10,2) DEFAULT NULL,
  `professional_tax` decimal(10,2) DEFAULT NULL,
  `net_salary` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `interview_date` date NOT NULL,
  `candidate_name` varchar(150) NOT NULL,
  `role` varchar(100) NOT NULL,
  `status` enum('Attended','Selected','Rejected') DEFAULT 'Attended',
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `interview_date`, `candidate_name`, `role`, `status`, `comments`, `created_at`, `updated_at`) VALUES
(2, '2026-02-13', 'dk', 'java', 'Attended', 'gg', '2026-02-12 10:42:20', '2026-02-12 10:42:20'),
(3, '2026-02-13', 'dk', 'java', 'Attended', 'gg', '2026-02-12 10:42:22', '2026-02-12 10:42:22'),
(4, '2025-02-20', 'Rahul Kumar', 'Frontend Developer', 'Attended', 'Initial screening completed', '2026-02-12 11:05:19', '2026-02-12 11:05:19'),
(5, '2025-02-21', 'Priya Sharma', 'Backend Developer', 'Attended', 'Strong Java and Spring Boot skills', '2026-02-12 11:05:19', '2026-02-12 11:05:19'),
(6, '2025-02-22', 'Arun Kumar', 'Full Stack Developer', 'Selected', 'Lacks project experience', '2026-02-12 11:05:19', '2026-02-12 11:05:19'),
(7, '2025-02-23', 'Sneha R', 'UI/UX Designer', 'Selected', 'Portfolio review pending', '2026-02-12 11:05:19', '2026-02-12 11:05:19'),
(8, '2025-02-24', 'Vikram Singh', 'React Developer', 'Selected', 'Excellent React and UI skills', '2026-02-12 11:05:19', '2026-02-12 11:05:19');

-- --------------------------------------------------------

--
-- Table structure for table `resigned_candidates`
--

CREATE TABLE `resigned_candidates` (
  `id` int(11) NOT NULL,
  `interview_date` date DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(50) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `days_worked` int(11) DEFAULT NULL,
  `reason_left` text DEFAULT NULL,
  `doc_handover` varchar(50) DEFAULT NULL,
  `salary_status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` varchar(50) NOT NULL DEFAULT 'Employee',
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `role`, `last_login`) VALUES
(24, 'testing', 'testing@gmail.com', '$2b$10$AWDqY8/dqe1tVcee5UL5feEWv8kVnJKTHPqcI9kAHYifP4VhIXuSq', '2026-02-13 05:37:28', 'Employee', '2026-02-14 14:28:05'),
(25, 'Adminee', 'admin@gmail.com', '$2b$10$yYHE1.CRMQ4sMGlgZ56p9eZMtrghJrrkBO9aVn4dxBmiOficaab4K', '2026-02-13 12:35:06', 'Admin', '2026-02-14 16:43:55'),
(26, 'hrehh', 'hr@gmail.com', '$2b$10$9AQA/Kc.x5OB7aIFISxFce5p3TtuK38dJrnVZHxgY6GTvzGVnv9Eu', '2026-02-13 12:36:38', 'HR', '2026-02-14 14:23:12'),
(27, 'TL', 'tl@gmail.com', '$2b$10$I3jnwGGVxEuti54P2vol6upr.ot/drDIB9tFD2mGFeV3lJt9OO742', '2026-02-13 12:38:25', 'Team Lead', '2026-02-13 18:08:45'),
(30, 'emp', 'empp@gmail.com', '$2b$10$WEAgi9D.tEoo93h/oQPF1Of/0yCsNP8U1RfBdq3nQHTBhl7rxSdsO', '2026-02-13 12:43:13', 'Employee', NULL),
(31, 'hrr', 'hr1@gmail.com', '$2b$10$6FgBaqlEVDfqh6GiN8Shlev8U7vKk0d6rgmUIhvvqYGm1VtZA0Te2', '2026-02-14 07:30:16', 'HR', '2026-02-14 13:00:29'),
(32, 'TL', 'tll@gmail.com', '$2b$10$U6bBSTRu09rM31ZWRS/GUeXEE6.44ORrSOFv1H0FOaiaosL/DwMsu', '2026-02-14 08:11:47', 'Team Lead', '2026-02-14 14:10:32'),
(33, 'gm', 'gm1@gmail.com', '$2b$10$SZYfKyllI43VUGXrU2IbludqikYUmOEwtr.ceurhstMyMhYHG93hO', '2026-02-14 08:13:04', 'General Manager', '2026-02-14 13:43:21'),
(34, 'hr2', 'hr2@gmail.com', '$2b$10$1awM2ZcpgShhFO6o80Yeg.7uHnY2ka5m3aN44kgFX0WUGZvMbap.K', '2026-02-14 08:53:49', 'HR', '2026-02-14 14:24:07'),
(35, 'emp', 'emp123@gmail.com', '$2b$10$jfFRg56D6wbakoMKEG6A.OtAauDP6McUTQQ3WE7C0Bf2NLCkOCiZS', '2026-02-14 09:07:52', 'Employee', '2026-02-14 14:37:57'),
(36, 'G Manager', 'generalmanager@gmail.com', '$2b$10$PnyC7vzO2OI6zKanF4KM.eESP7txy2MNqbISccTzJU7.3K12et4LK', '2026-02-14 09:08:48', 'General Manager', '2026-02-14 18:06:02'),
(37, 'HR manager', 'hrmanager@gmail.com', '$2b$10$cro4cg3RCntEZq04rghB2uL.CZtj1yOPYVX5HO3Ky/fZ8NQgB.aD.', '2026-02-14 09:10:27', 'HR', '2026-02-14 14:40:30'),
(38, 'TL', 'teamlead@gmail.com', '$2b$10$Lod3NrENYXsanW/vo.murODf/6eHS5BbvH1mV.koE6WaMkPie1uuO', '2026-02-14 09:13:29', 'Team Lead', '2026-02-14 15:06:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_reports`
--
ALTER TABLE `admin_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appointed_candidates`
--
ALTER TABLE `appointed_candidates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appraisal_cycles`
--
ALTER TABLE `appraisal_cycles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appraisal_parameters`
--
ALTER TABLE `appraisal_parameters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appraisal_ratings`
--
ALTER TABLE `appraisal_ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appraisal_id` (`appraisal_id`),
  ADD KEY `parameter_id` (`parameter_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`employee_id`,`attendance_date`);

--
-- Indexes for table `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `department_name` (`department_name`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `employee_appraisals`
--
ALTER TABLE `employee_appraisals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cycle_id` (`cycle_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `employee_employment`
--
ALTER TABLE `employee_employment`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `employee_financial`
--
ALTER TABLE `employee_financial`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `employee_monthly_reviews`
--
ALTER TABLE `employee_monthly_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_monthly_review` (`employee_id`,`evaluation_month`);

--
-- Indexes for table `employee_performance`
--
ALTER TABLE `employee_performance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `employee_personal_details`
--
ALTER TABLE `employee_personal_details`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hr_daily_task_reports`
--
ALTER TABLE `hr_daily_task_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hr_weekly_schedule`
--
ALTER TABLE `hr_weekly_schedule`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `other_portals`
--
ALTER TABLE `other_portals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_bills`
--
ALTER TABLE `payment_bills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payslips`
--
ALTER TABLE `payslips`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `resigned_candidates`
--
ALTER TABLE `resigned_candidates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_reports`
--
ALTER TABLE `admin_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `appointed_candidates`
--
ALTER TABLE `appointed_candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `appraisal_cycles`
--
ALTER TABLE `appraisal_cycles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `appraisal_parameters`
--
ALTER TABLE `appraisal_parameters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `appraisal_ratings`
--
ALTER TABLE `appraisal_ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=283;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `employee_appraisals`
--
ALTER TABLE `employee_appraisals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `employee_monthly_reviews`
--
ALTER TABLE `employee_monthly_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `employee_performance`
--
ALTER TABLE `employee_performance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `hr_daily_task_reports`
--
ALTER TABLE `hr_daily_task_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `hr_weekly_schedule`
--
ALTER TABLE `hr_weekly_schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `other_portals`
--
ALTER TABLE `other_portals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `payment_bills`
--
ALTER TABLE `payment_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `payslips`
--
ALTER TABLE `payslips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `resigned_candidates`
--
ALTER TABLE `resigned_candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appraisal_ratings`
--
ALTER TABLE `appraisal_ratings`
  ADD CONSTRAINT `appraisal_ratings_ibfk_1` FOREIGN KEY (`appraisal_id`) REFERENCES `employee_appraisals` (`id`),
  ADD CONSTRAINT `appraisal_ratings_ibfk_2` FOREIGN KEY (`parameter_id`) REFERENCES `appraisal_parameters` (`id`);

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_appraisals`
--
ALTER TABLE `employee_appraisals`
  ADD CONSTRAINT `employee_appraisals_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `appraisal_cycles` (`id`),
  ADD CONSTRAINT `employee_appraisals_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `employee_employment`
--
ALTER TABLE `employee_employment`
  ADD CONSTRAINT `employee_employment_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `employee_financial`
--
ALTER TABLE `employee_financial`
  ADD CONSTRAINT `employee_financial_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `employee_personal_details`
--
ALTER TABLE `employee_personal_details`
  ADD CONSTRAINT `employee_personal_details_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
