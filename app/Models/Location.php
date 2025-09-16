<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $connection = 'employee_db';
    protected $table = 'tvwLocation';
    protected $primaryKey = 'AreaCluster_ID';

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'Employee_ID', 'Employee_ID');
    }
}
