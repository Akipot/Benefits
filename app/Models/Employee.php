<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Model;


class Employee extends Model
{
    protected $connection = 'employee_db';
    protected $table = 'vwEmpPosition';
    protected $primaryKey = 'Employee_ID';

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'Password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'Password' => 'hashed',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'Emp_ID', 'Employee_ID');
    }

    public function location()
    {
        return $this->hasOne(Location::class, 'Employee_ID', 'Employee_ID');
    }
}
