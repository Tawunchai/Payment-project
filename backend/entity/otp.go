// entity/otp.go
package entity

import "gorm.io/gorm"

type OTP struct {
    gorm.Model
    Email     string
    Code      string
    ExpiresAt int64 // เก็บเวลาเป็น Unix timestamp
    Verified  bool
}
