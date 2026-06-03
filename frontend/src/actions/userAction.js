import * as UserApi from "../api/UserRequest.js"
//import User from "../components/User/User.jsx";


export const updateUser = (id, formData) => async (dispatch, getState) => {
  dispatch({ type: "UPDATING_START" })
  try {
    const { data } = await UserApi.updateUser(id, formData);
    dispatch({ 
      type: "UPDATING_SUCCESS", 
      data: { 
        user: data.user,
        token: data.token
      }
    })
  } catch (error) {
    dispatch({ type: "UPDATING_FAIL" })
  }
}

export const followUser = (id, data) => async(dispatch) => {
    dispatch({type: "FOLLOW_USER", data: data})
    UserApi.followUser(id, data)
}

export const unFollowUser = (id, data) => async(dispatch) => {
    dispatch({type: "UNFOLLOW_USER", data: data})
    UserApi.unFollowUser(id, data)
}