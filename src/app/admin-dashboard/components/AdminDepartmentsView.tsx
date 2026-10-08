'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { mockSubjects } from '@/repositories/mockData';
import { Subject } from '@/types/campus';
import { campusRepository } from '@/repositories/campusRepository';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AdminDepartmentsView() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [addSubjectModalOpen, setAddSubjectModalOpen] = useState(false);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const list = await campusRepository.getSubjects();
        if (list && list.length > 0) {
          setSubjects(list);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    }
    loadSubjects();
  }, []);

  // New Subject Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubSem, setNewSubSem] = useState('5');
  const [newSubCredits, setNewSubCredits] = useState('4');
  const [newSubInstructor, setNewSubInstructor] = useState('Dr. Priya Nair');

  const bcaCohorts = [
    {
      year: 1,
      yearLabel: '1st Year (Freshmen)',
      semesters: 'Semesters 1 & 2',
      enrolled: 128,
      facultyCount: 8,
      coordinator: 'Prof. Anil Kumar',
      subjectsCount: subjects.filter((s) => s.year === 1).length,
    },
    {
      year: 2,
      yearLabel: '2nd Year (Sophomores)',
      semesters: 'Semesters 3 & 4',
      enrolled: 124,
      facultyCount: 10,
      coordinator: 'Dr. Suresh Pillai',
      subjectsCount: subjects.filter((s) => s.year === 2).length,
    },
    {
      year: 3,
      yearLabel: '3rd Year (Seniors)',
      semesters: 'Semesters 5 & 6',
      enrolled: 132,
      facultyCount: 12,
      coordinator: 'Dr. Priya Nair',
      subjectsCount: subjects.filter((s) => s.year === 3).length,
    },
  ];

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) {
      toast.error('Please enter course name and code');
      return;
    }

    const semNum = parseInt(newSubSem, 10) as 1 | 2 | 3 | 4 | 5 | 6;
    const yearNum = Math.ceil(semNum / 2) as 1 | 2 | 3;
    const created: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubName,
      code: newSubCode,
      department: 'BCA',
      semester: `Semester ${semNum}`,
      semesterNumber: semNum,
      year: yearNum,
      type: 'THEORY',
      credits: parseInt(newSubCredits, 10) || 4,
      instructor: newSubInstructor,
      syllabusCoveragePct: 0,
      syllabusProgress: 0,
      attendanceRate: 100,
      colorBadge: 'badge-cyan',
    };

    setSubjects((prev) => [created, ...prev]);
    toast.success(`Course "${newSubName} (${newSubCode})" registered in BCA Semester ${semNum}!`);
    setAddSubjectModalOpen(false);
    setNewSubName('');
    setNewSubCode('');
  };

  const filteredSubjects = subjects.filter((s) => {
    if (selectedSemester !== 'all' && s.semesterNumber !== selectedSemester) {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-800 text-foreground tracking-tight">
              BCA Academic Department & 3-Year Curriculum
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bachelor of Computer Applications · 384 Enrolled Students · 30 Specialized Faculty
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddSubjectModalOpen(true)}
            className="text-xs font-700 shadow-glow"
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          >
            Add New Course
          </Button>
        </div>

        {/* BCA 3-Year Cohorts Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {bcaCohorts.map((cohort) => (
            <div
              key={cohort.year}
              className="bg-white rounded-[18px] p-5 border border-black/[0.06] flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge-green text-xs px-2.5 py-0.5 rounded-lg font-semibold">
                    BCA Year {cohort.year}
                  </span>
                  <span className="text-xs text-[#6E6E73] font-mono-data">
                    {cohort.semesters}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1">{cohort.yearLabel}</h3>
                <p className="text-xs text-[#6E6E73] mb-4">
                  Academic Lead:{' '}
                  <span className="text-[#1D1D1F] font-semibold">{cohort.coordinator}</span>
                </p>

                <div className="p-3.5 rounded-[14px] bg-[#F5F5F7] border border-black/[0.04] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Enrolled Students</span>
                    <span className="font-semibold text-primary-dark metric-value">
                      {cohort.enrolled} Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Curriculum Courses</span>
                    <span className="font-semibold text-[#1D1D1F]">
                      {cohort.subjectsCount} Subjects
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E73]">Faculty Allocation</span>
                    <span className="font-medium text-primary-dark">
                      {cohort.facultyCount} Instructors
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-black/[0.06] flex items-center justify-between text-xs">
                <span className="text-primary-dark font-medium">● Accredited UGC BCA</span>
                <button
                  onClick={() => {
                    const targetSem = cohort.year * 2 - 1;
                    setSelectedSemester(targetSem as any);
                    toast.info(`Filtered curriculum to BCA Year ${cohort.year}`);
                  }}
                  className="text-primary-dark hover:underline font-semibold cursor-pointer active:scale-[0.98]"
                >
                  View Year Curriculum →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Registered Subjects Table */}
        <div className="bg-white rounded-[18px] border border-black/[0.06] overflow-hidden shadow-card">
          <div className="p-5 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F] tracking-tight">
                Master BCA Curriculum ({filteredSubjects.length} Courses)
              </h3>
              <p className="text-xs text-[#6E6E73]">Standardized 3-Year Curriculum Directory</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[#6E6E73]">Semester:</label>
              <select
                value={selectedSemester}
                onChange={(e) =>
                  setSelectedSemester(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
                }
                className="bg-white border border-black/[0.08] rounded-[11px] px-3 py-1.5 text-xs text-[#1D1D1F] font-medium outline-none cursor-pointer focus:border-primary"
              >
                <option value="all">All 6 Semesters</option>
                <option value="1">Semester 1 (1st Year)</option>
                <option value="2">Semester 2 (1st Year)</option>
                <option value="3">Semester 3 (2nd Year)</option>
                <option value="4">Semester 4 (2nd Year)</option>
                <option value="5">Semester 5 (3rd Year)</option>
                <option value="6">Semester 6 (3rd Year)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#FAFAFC] border-b border-black/[0.06] text-[#6E6E73] font-semibold text-left">
                  <th className="py-3.5 px-4 font-medium">Code</th>
                  <th className="py-3.5 px-4 font-medium">Course Name</th>
                  <th className="py-3.5 px-4 font-medium">Term & Year</th>
                  <th className="py-3.5 px-4 font-medium">Type</th>
                  <th className="py-3.5 px-4 font-medium">Credits</th>
                  <th className="py-3.5 px-4 text-right font-medium">Primary Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F5F5F7]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono-data font-semibold text-[#1D1D1F]">
                      {sub.code}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1D1D1F]">{sub.name}</td>
                    <td className="py-3.5 px-4 text-[#6E6E73]">
                      BCA {sub.semester} (Year {sub.year})
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="badge-cyan text-[10px] px-2 py-0.5 rounded font-semibold">
                        {sub.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-primary-dark font-mono-data">
                      {sub.credits} Credits
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#1D1D1F]">
                      {sub.instructor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {addSubjectModalOpen && (
        <Modal
          isOpen={addSubjectModalOpen}
          onClose={() => setAddSubjectModalOpen(false)}
          title="Register New BCA Curriculum Course"
          description="Add a new academic course, assign credits, and allocate primary faculty"
          footer={
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAddSubjectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddSubject}>
                Register Course
              </Button>
            </div>
          }
        >
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Cloud Computing & Distributed Systems"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  placeholder="CS506"
                  className="input-field font-mono-data"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  BCA Semester
                </label>
                <select
                  value={newSubSem}
                  onChange={(e) => setNewSubSem(e.target.value)}
                  className="input-field cursor-pointer font-600"
                >
                  <option value="1">Semester 1 (Year 1)</option>
                  <option value="2">Semester 2 (Year 1)</option>
                  <option value="3">Semester 3 (Year 2)</option>
                  <option value="4">Semester 4 (Year 2)</option>
                  <option value="5">Semester 5 (Year 3)</option>
                  <option value="6">Semester 6 (Year 3)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={newSubCredits}
                  onChange={(e) => setNewSubCredits(e.target.value)}
                  className="input-field font-mono-data"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-700 uppercase tracking-wider text-muted-foreground mb-1">
                Assigned Faculty / Instructor
              </label>
              <input
                type="text"
                value={newSubInstructor}
                onChange={(e) => setNewSubInstructor(e.target.value)}
                placeholder="Dr. Priya Nair"
                className="input-field"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
