<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $connection = 'employee_db';
    protected $table = 'Department';
    protected $primaryKey = 'Department_ID';

    public function info()
    {
        return $this->hasMany(UserDepartment::class, 'Department_ID');
    }

}
