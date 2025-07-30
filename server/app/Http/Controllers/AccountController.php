<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('badge_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->get('role'));
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'badge_number' => 'required|string|unique:users',
            'division' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'required|string',
            'role' => 'required|in:admin,employee',
            'password' => 'required|string|min:8'
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'badge_number' => $request->badge_number,
            'division' => $request->division,
            'phone' => $request->phone,
            'address' => $request->address,
            'role' => $request->role,
            'password' => Hash::make($request->password)
        ]);

        return response()->json($user, 201);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'badge_number' => ['required', 'string', Rule::unique('users')->ignore($user->id)],
            'division' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'address' => 'required|string',
            'role' => 'required|in:admin,employee'
        ]);

        $user->update($request->only([
            'first_name', 'last_name', 'email', 'badge_number',
            'division', 'phone', 'address', 'role'
        ]));

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:8'
        ]);

        $user = User::findOrFail($id);
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json(['message' => 'Password reset successfully']);
    }
}
