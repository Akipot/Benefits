<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDepartment extends Model
{
    protected $connection = 'employee_db';
    protected $table = 'tvwEmpPosition';
    protected $primaryKey = 'Employee_ID';

    public function user()
    {
        return $this->belongsTo(User::class, 'Employee_ID', 'Emp_ID');
    }

    public function departmentInfo()
    {
        return $this->belongsTo(Department::class, 'Department_ID');
    }

}
