'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { mockDepartments, mockSubjects } from '@/repositories/mockData';
import { Department, Subject } from '@/types/campus';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AdminDepartmentsView() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [addSubjectModalOpen, setAddSubjectModalOpen] = useState(false);

  // New Subject Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubDept, setNewSubDept] = useState('BCA');
  const [newSubSem, setNewSubSem] = useState('Sem 5');
  const [newSubCredits, setNewSubCredits] = useState('4');
  const [newSubInstructor, setNewSubInstructor] = useState('Dr. Priya Nair');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) {
      toast.error('Please enter course name and code');
      return;
    }

    const created: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubName,
      code: newSubCode,
      department: newSubDept,
      semester: newSubSem,
      credits: parseInt(newSubCredits) || 4,
      instructor: newSubInstructor,
      syllabusCoveragePct: 0,
      syllabusProgress: 0,
      attendanceRate: 100,
      colorBadge: 'badge-cyan',
    };

    setSubjects((prev) => [created, ...prev]);
    toast.success(`Course "${newSubName} (${newSubCode})" registered into ${newSubDept}!`);
    setAddSubjectModalOpen(false);
    setNewSubName('');
    setNewSubCode('');
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-700 text-foreground">Academic Departments & Curriculum</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              5 Academic Departments · 1,556 Total Registered Students · 82 Faculty
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddSubjectModalOpen(true)}
            leftIcon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            }
          >
            Add New Course
          </Button>
        </div>

        {/* Departments Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge-violet text-xs px-2.5 py-0.5 rounded-lg font-700">
                    {dept.code}
                  </span>
                  <span className="text-xs text-muted-foreground font-500">
                    {dept.totalFaculty} Faculty
                  </span>
                </div>

                <h3 className="text-lg font-700 text-foreground mb-1">{dept.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Head of Dept:{' '}
                  <span className="text-foreground font-600">{dept.headOfDepartment}</span>
                </p>

                <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Enrolled</span>
                    <span className="font-700 text-primary metric-value">
                      {dept.totalStudents} Students
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Courses</span>
                    <span className="font-600 text-foreground">
                      {subjects.filter(
                        (s) => s.department.toLowerCase() === dept.code.toLowerCase()
                      ).length || 4}{' '}
                      Subjects
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-success font-600">● Accredited Tier-1</span>
                <button
                  onClick={() => toast.info(`Viewing ${dept.name} curriculum blueprint`)}
                  className="text-primary hover:underline font-500 cursor-pointer"
                >
                  Manage Curriculum →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Registered Subjects Table */}
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border/80 flex items-center justify-between">
            <h3 className="text-base font-600 text-foreground">
              Master Course Curriculum ({subjects.length})
            </h3>
            <Badge variant="cyan">Fall 2026</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Course Name</th>
                  <th className="py-3.5 px-4">Department & Term</th>
                  <th className="py-3.5 px-4">Credits</th>
                  <th className="py-3.5 px-4 text-right">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono-data font-700 text-foreground">
                      {sub.code}
                    </td>
                    <td className="py-3.5 px-4 font-600 text-foreground">{sub.name}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {sub.department} · {sub.semester}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-primary">
                      {sub.credits} Credits
                    </td>
                    <td className="py-3.5 px-4 text-right font-500 text-foreground">
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
          title="Register New Curriculum Course"
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
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Cloud Computing & DevOps"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  placeholder="CS506"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Department
                </label>
                <select
                  value={newSubDept}
                  onChange={(e) => setNewSubDept(e.target.value)}
                  className="input-field"
                >
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="BBA">BBA</option>
                  <option value="B.Com">B.Com</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Semester
                </label>
                <select
                  value={newSubSem}
                  onChange={(e) => setNewSubSem(e.target.value)}
                  className="input-field"
                >
                  <option value="Sem 1">Sem 1</option>
                  <option value="Sem 3">Sem 3</option>
                  <option value="Sem 5">Sem 5</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={newSubCredits}
                  onChange={(e) => setNewSubCredits(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-600 uppercase tracking-wider text-muted-foreground mb-1">
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
