function successResponse(data = null, message = 'İşlem başarıyla tamamlandı') {
  return {
    success: true,
    message,
    data
  };
}

function errorResponse(message = 'Bir hata oluştu', errors = null, statusCode = 500) {
  return {
    success: false,
    message,
    errors,
    statusCode
  };
}

function paginatedResponse(data, total, page = 1, limit = 10, message = 'Veriler başarıyla getirildi') {
  return {
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
}; 