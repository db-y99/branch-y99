"use server";

import { createProfileIfNotExists } from "@/actions/profiles";

export async function loginAction(_prevState: any, formData: FormData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return {
        status: "error",
        errors: {
          email: "Email is required.",
          password: "Password is required.",
        },
      };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Call login API
    const filter = JSON.stringify({
      username: email,
      password: password,
    });
    const valuesParam =
      "id,username,password,avatar,fullname,display_name,type__code,type__name,blocked,block_reason,block_reason__code,block_reason__name,blocked_by,last_login,auth_method,auth_method__code,auth_method__name,auth_status,auth_status__code,auth_status__name,register_method,register_method__code,register_method__name,create_time,update_time";
    const url = `${apiUrl}/login/?values=${valuesParam}&filter=${encodeURIComponent(
      filter,
    )}`;

    const response = await fetch(url);

    // const data = await response.json();
    // if (!data) {
    //   return {
    //     status: "error",
    //     errors: {
    //       email: "Invalid email or password.",
    //       password: "Invalid email or password.",
    //     },
    //   };
    // }

    const text = await response.text();

    let data: any;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return {
        status: "error",
        errors: {
          email: "Invalid email or password.",
          password: "Invalid email or password.",
        },
      };
    }

    // ❗ LOGIN FAIL
    if (!data) {
      return {
        status: "error",
        errors: {
          email: "Invalid email or password.",
          password: "Invalid email or password.",
        },
      };
    }

    // Check and create profile in Supabase
    const username = email as string;
    const fullName = data?.rows?.fullname || "";
    const id = data?.rows?.id;

    console.log({ username, fullName, id });

    // If profile doesn't exist, create it (role will use default 'user' from database)
    const { error: insertError } = await createProfileIfNotExists(
      id,
      username,
      fullName,
    );

    if (insertError) {
      console.error("Failed to create profile:", insertError);

      return {
        status: "error",
        errors: {
          email: "Failed to create profile.",
          password: "Failed to create profile.",
        },
      };
    }

    return {
      status: "success",
      data: data.rows,
    };
  } catch (err) {
    console.error(err);

    return {
      status: "error",
      errors: {
        email: "Invalid email or password.",
        password: "Invalid email or password.",
      },
    };
  }
}
